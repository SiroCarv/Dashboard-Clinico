// Registro de ESTUDIANTES sin correo electrónico.
//
// El estudiante entra con un "código de estudiante" (UNI-000123) que
// asigna el servidor, y con la contraseña que él mismo eligió. Supabase
// Auth exige un correo para toda cuenta, así que se le crea uno interno
// derivado de ese código (UNI-000123 -> uni-000123@estudiantes.plataforma.invalid).
// Ese correo no existe de verdad, no se le muestra al estudiante y no se
// guarda en `usuarios.email` (queda vacío), así no aparece en el panel.
//
// Se ejecuta con la service_role key porque quien llama todavía no tiene
// cuenta (no hay sesión). Por eso TODAS las validaciones se hacen acá, en
// el servidor, y no se confía en nada que mande el navegador.
//
// IMPORTANTE: el dominio de abajo debe ser idéntico al de
// src/modules/autenticacion/data/accesoEstudiante.js (el Login lo usa
// para convertir el código en el correo interno).

import { createClient } from 'jsr:@supabase/supabase-js@2';

const DOMINIO_INTERNO = 'estudiantes.plataforma.invalid';
const PASSWORD_MINIMA = 6;

const CURSOS = [
  '1ro de Secundaria',
  '2do de Secundaria',
  '3ro de Secundaria',
  '4to de Secundaria',
  '5to de Secundaria',
  '6to de Secundaria',
];
const PARALELOS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TURNOS = ['Mañana', 'Tarde'];
const GENEROS = ['Masculino', 'Femenino', 'Prefiero no decir'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function respuestaError(status: number, mensaje: string) {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function respuestaOk(data: unknown) {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return respuestaError(405, 'Método no permitido.');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  let idCreado: string | null = null;

  try {
    const body = await req.json();
    const nombre = String(body?.nombre ?? '').trim().replace(/\s+/g, ' ');
    const codigoInstitucion = String(body?.codigoInstitucion ?? '').trim().toUpperCase();
    const password = String(body?.password ?? '');
    const curso = String(body?.curso ?? '');
    const paralelo = String(body?.paralelo ?? '');
    const turno = String(body?.turno ?? '');
    const genero = String(body?.genero ?? '');

    if (nombre.length < 3 || nombre.length > 120) {
      return respuestaError(400, 'Escribe tu nombre completo.');
    }
    if (!codigoInstitucion) {
      return respuestaError(400, 'Falta el código de institución.');
    }
    if (password.length < PASSWORD_MINIMA) {
      return respuestaError(400, `La contraseña debe tener al menos ${PASSWORD_MINIMA} caracteres.`);
    }
    if (
      !CURSOS.includes(curso) ||
      !PARALELOS.includes(paralelo) ||
      !TURNOS.includes(turno) ||
      !GENEROS.includes(genero)
    ) {
      return respuestaError(400, 'Completa curso, paralelo, turno y género.');
    }

    // Mismo criterio que la verificación en vivo del formulario: solo
    // Unidad Educativa (o instituciones antiguas sin tipo guardado).
    const { data: institucion, error: instError } = await supabaseAdmin
      .from('instituciones')
      .select('id')
      .eq('codigo_registro', codigoInstitucion)
      .or('tipo_institucion.eq.unidad_educativa,tipo_institucion.is.null')
      .maybeSingle();

    if (instError) {
      return respuestaError(500, 'No se pudo verificar la institución. Intenta nuevamente.');
    }
    if (!institucion) {
      return respuestaError(400, 'El código de institución no es válido.');
    }

    // 1) Cuenta de Auth con un correo provisional (todavía no se conoce el
    //    código de estudiante, que lo asigna la base al crear el perfil).
    const { data: nuevo, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `alta-${crypto.randomUUID()}@${DOMINIO_INTERNO}`,
      password,
      email_confirm: true,
    });
    if (authError || !nuevo?.user) {
      return respuestaError(500, 'No se pudo crear la cuenta. Intenta nuevamente.');
    }
    idCreado = nuevo.user.id;

    // 2) Perfil. codigo_estudiante lo asigna el trigger del servidor.
    //    email queda vacío a propósito.
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('usuarios')
      .insert([
        {
          id: idCreado,
          rol: 'paciente',
          institucion_id: institucion.id,
          nombre,
          curso,
          paralelo,
          turno,
          genero,
        },
      ])
      .select('codigo_estudiante')
      .single();

    if (perfilError || !perfil?.codigo_estudiante) {
      throw new Error('No se pudo crear el perfil del estudiante.');
    }

    // 3) El correo interno definitivo se deriva del código asignado.
    const codigo: string = perfil.codigo_estudiante;
    const { error: updError } = await supabaseAdmin.auth.admin.updateUserById(idCreado, {
      email: `${codigo.toLowerCase()}@${DOMINIO_INTERNO}`,
      email_confirm: true,
    });
    if (updError) {
      throw new Error('No se pudo terminar de configurar la cuenta.');
    }

    return respuestaOk({ codigo_estudiante: codigo });
  } catch (err) {
    // Compensación: no dejar una cuenta a medias.
    if (idCreado) {
      await supabaseAdmin.from('usuarios').delete().eq('id', idCreado);
      await supabaseAdmin.auth.admin.deleteUser(idCreado);
    }
    console.error('registrar-estudiante:', err instanceof Error ? err.message : String(err));
    return respuestaError(500, 'No se pudo completar el registro. Intenta nuevamente.');
  }
});
