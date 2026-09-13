// Acceso a Supabase para el rol Persona Particular: buscar la
// institución (debe ser un Centro de Salud), registrar la cuenta e
// iniciar sesión — todo sin correo electrónico.
//
// TRUCO DE DISEÑO (documentado a propósito, para que quede claro por
// qué existe): Supabase Auth exige un identificador con forma de email
// para signUp/signInWithPassword. Como esta historia elimina el correo
// por completo, armamos acá un "email sintético" a partir del carnet de
// identidad (ej. "CP-12345678@particular.sistema-clinico.local") que la
// persona NUNCA ve ni escribe — en pantalla solo existen los campos
// Carnet de Identidad y PIN. El PIN es la contraseña real de Supabase
// Auth: por eso exige 6 dígitos (LONGITUD_PIN), no menos — es el mínimo
// de caracteres que Supabase Auth exige por defecto para cualquier
// contraseña, y así evitamos tener que tocar la configuración del
// proyecto.
//
// Por qué NO reutilizamos el mecanismo de "Consultante particular"
// (psicologo_asignado_id, sin institución) que existió antes de
// SCRUM-46/47/48: esta Persona Particular sí necesita quedar ligada a
// una institución de tipo Centro de Salud, para que el/la psicólogo/a
// de ESE centro la vea en su panel vía RLS (igual que Estudiante/
// Docente) — no hay un psicólogo puntual "asignado a mano" en este
// flujo.
import { supabase } from '../../../core/api/supabaseClient';

const DOMINIO_SINTETICO = 'particular.sistema-clinico.local';
export const LONGITUD_PIN = 6;

function limpiarCarnet(carnetIdentidad) {
  return carnetIdentidad.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function construirEmailSintetico(carnetIdentidad) {
  return `cp-${limpiarCarnet(carnetIdentidad).toLowerCase()}@${DOMINIO_SINTETICO}`;
}

export const personasParticularesService = {
  /**
   * Verifica en vivo un código de institución, igual que Registro.jsx/
   * RegistroDocente.jsx — pero exige que sea un Centro de Salud. Si el
   * código existe pero pertenece a un colegio u otra institución,
   * devuelve `tipoIncorrecto: true` en vez de tratarlo como "no
   * encontrado", para poder mostrar un mensaje específico.
   */
  async buscarCentroDeSalud(codigo) {
    const { data, error } = await supabase
      .from('instituciones')
      .select('id, nombre, tipo_institucion')
      .eq('codigo_registro', codigo.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (!data) return { institucion: null, tipoIncorrecto: false };

    if (data.tipo_institucion !== 'centro_salud') {
      return { institucion: null, tipoIncorrecto: true };
    }

    return { institucion: { id: data.id, nombre: data.nombre }, tipoIncorrecto: false };
  },

  /**
   * Registra la cuenta: crea el usuario en Supabase Auth con el email
   * sintético + PIN, y en el mismo flujo inserta su fila en `usuarios`
   * con todos los campos del perfil (SCRUM pendiente de numerar).
   */
  async registrar({
    institucionId,
    carnetIdentidad,
    pin,
    nombre,
    telefono,
    edad,
    sexo,
    estadoCivil,
    gradoInstruccion,
    numeroHijos,
    tipoTrabajo,
  }) {
    const emailSintetico = construirEmailSintetico(carnetIdentidad);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailSintetico,
      password: pin,
    });

    if (authError) {
      const yaRegistrado =
        authError.message?.toLowerCase().includes('already registered') ||
        authError.code === 'user_already_exists';

      if (yaRegistrado) {
        throw new Error('Este carnet de identidad ya está registrado.');
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Error al crear la cuenta. Intenta nuevamente.');
    }

    const { error: userError } = await supabase.from('usuarios').insert([
      {
        id: authData.user.id,
        rol: 'persona_particular',
        institucion_id: institucionId,
        email: emailSintetico,
        carnet_identidad: limpiarCarnet(carnetIdentidad),
        nombre,
        telefono,
        edad,
        sexo,
        estado_civil: estadoCivil,
        grado_instruccion: gradoInstruccion,
        numero_hijos: numeroHijos,
        tipo_trabajo: tipoTrabajo,
      },
    ]);

    if (userError) throw userError;
  },

  /**
   * Inicia sesión con carnet + PIN. Reclama la misma "sesión única" que
   * ya usa Login.jsx (RPC `iniciar_sesion_unica`) — un centro de salud
   * suele compartir computadora entre varios pacientes, así que esta
   * protección importa acá igual o más que para Estudiante/Docente.
   * Devuelve `{ sesionConcedida }`; si es `false`, quien llama debe
   * mostrar la misma pantalla de "forzar ingreso" que ya existe en
   * Login.jsx antes de navegar.
   */
  async iniciarSesion({ carnetIdentidad, pin }) {
    const emailSintetico = construirEmailSintetico(carnetIdentidad);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailSintetico,
      password: pin,
    });

    // Supabase no distingue "carnet inexistente" de "PIN incorrecto" en
    // este error — perfecto para el criterio de no revelar cuál de los
    // dos datos falló.
    if (authError) throw new Error('Carnet de identidad o PIN incorrectos.');

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', authData.user.id)
      .single();

    if (userError || userData?.rol !== 'persona_particular') {
      await supabase.auth.signOut();
      throw new Error('Esta cuenta no corresponde a un perfil de Persona Particular.');
    }

    const { data: sesionConcedida, error: sesionError } = await supabase.rpc('iniciar_sesion_unica');
    if (sesionError) {
      await supabase.auth.signOut();
      throw new Error('No se pudo verificar la sesión. Intenta nuevamente.');
    }

    return { sesionConcedida };
  },
};