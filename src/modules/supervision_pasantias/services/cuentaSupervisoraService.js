// Gestión, por parte del superadmin, de la cuenta ÚNICA de Docente
// Supervisora y de la marca "pasante" de las cuentas de psicólogo/a.
//
// Alta y edición de la cuenta pasan por Edge Functions (crear-docente-
// supervisora / editar-docente-supervisora): crear o cambiar el correo y la
// contraseña de un usuario de Auth requiere la service_role key, que solo
// existe del lado servidor. No hay baja: con una sola cuenta y un historial
// de calificaciones que conservar, si cambia la persona se edita la misma
// cuenta (ver editar-docente-supervisora).
//
// La marca "pasante" (tabla `pasantes`) SÍ se escribe directo desde acá: es
// una tabla simple cuya política de escritura solo permite al superadmin, y
// la base además exige que la cuenta marcada sea un psicólogo/a.
//
// Lectura: depende de las políticas RLS del superadmin (`usuarios_select`
// incluye `is_superadmin()`); para cualquier otro rol estas consultas no
// devuelven filas.
import { supabase } from '../../../core/api/supabaseClient';
import { invocarFuncionEdge } from '../../../shared/utils/invocarFuncionEdge';

export const cuentaSupervisoraService = {
  /** La cuenta de la Docente Supervisora, o `null` si todavía no se creó. */
  async obtenerCuenta() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, created_at')
      .eq('rol', 'docente_supervisora')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async crear({ nombre, correo, passwordTemporal }) {
    return invocarFuncionEdge('crear-docente-supervisora', {
      nombre,
      email: correo,
      password: passwordTemporal,
    });
  },

  // `passwordNueva` vacía = no cambiar la contraseña (el campo se omite del
  // cuerpo al ser undefined).
  async editar(id, { nombre, correo, passwordNueva }) {
    return invocarFuncionEdge('editar-docente-supervisora', {
      id,
      nombre,
      email: correo,
      password: passwordNueva || undefined,
    });
  },

  /**
   * Todas las cuentas de psicólogo/a con su institución y si están marcadas
   * como pasantes, por orden alfabético. Se piden 3 listas chicas y se
   * cruzan acá en vez de un embed encadenado, para no depender de cómo
   * PostgREST resuelve la relación uno a uno de `psicologo_institucion`.
   */
  async listarPsicologos() {
    const [psicologos, pasantes, asignaciones] = await Promise.all([
      supabase
        .from('usuarios')
        .select('id, nombre, email, turno_psicologo')
        .eq('rol', 'psicologo')
        .order('nombre', { ascending: true }),
      supabase.from('pasantes').select('psicologo_id'),
      supabase.from('psicologo_institucion').select('psicologo_id, institucion:instituciones(nombre)'),
    ]);

    if (psicologos.error) throw psicologos.error;
    if (pasantes.error) throw pasantes.error;
    if (asignaciones.error) throw asignaciones.error;

    const idsPasantes = new Set((pasantes.data ?? []).map((p) => p.psicologo_id));
    const institucionPorPsicologo = new Map(
      (asignaciones.data ?? []).map((a) => [a.psicologo_id, a.institucion?.nombre ?? null])
    );

    return (psicologos.data ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      email: p.email,
      turno: p.turno_psicologo,
      institucion: institucionPorPsicologo.get(p.id) ?? null,
      esPasante: idsPasantes.has(p.id),
    }));
  },

  async marcarPasante(idPsicologo) {
    const { error } = await supabase.from('pasantes').insert({ psicologo_id: idPsicologo });
    if (error) throw error;
  },

  async desmarcarPasante(idPsicologo) {
    const { error } = await supabase.from('pasantes').delete().eq('psicologo_id', idPsicologo);
    if (error) throw error;
  },
};
