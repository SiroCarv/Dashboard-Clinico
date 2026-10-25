// Acceso a la tabla `psicologo_institucion` y al listado de cuentas con
// rol 'psicologo' — usado por AsignacionPsicologos.jsx para saber a qué
// institución (una sola) está vinculado cada psicólogo.
//
// Desde la migración 006 la tabla tiene una restricción UNIQUE(psicologo_id)
// en la base: un psicólogo ya no puede tener más de una fila.
//
// Cuántos psicólogos admite una institución (cambia según su tipo):
//   - Instituciones que NO son Centro de Salud: UNO solo. Lo hace cumplir
//     un trigger de la base (antes era la restricción UNIQUE(institucion_id)
//     de la migración 007, que se retiró para permitir varios psicólogos
//     por centro). El trigger rechaza el segundo psicólogo con el mismo
//     código '23505' (unique_violation) que daba la restricción, así que
//     la traducción de errores de `asignar()` sigue valiendo igual.
//   - Centros de Salud: VARIOS (historia nueva, pedida por la cliente para
//     el rol de Jefe/a de Centro, que supervisa a todo el equipo).
//
// Reasignación de institución entre psicólogos (migración 008 —
// corrige el bloqueo de SCRUM-73 sin editar esa historia cerrada): si la
// institución elegida (que no es Centro de Salud) ya estaba ocupada por
// otro psicólogo, `asignar_psicologo_institucion` desvincula, dentro de
// la misma transacción, a ese otro psicólogo antes de insertar la fila
// nueva — el reemplazo es intencional: AsignacionPsicologos.jsx ya avisa
// y pide confirmación explícita antes de llamar a este método cuando eso
// va a pasar. En un Centro de Salud el RPC NO desvincula a nadie: suma al
// psicólogo al equipo. asignar() sigue llamando al mismo RPC (no dos pasos
// DELETE+INSERT separados desde el cliente, por la misma razón de
// siempre: si el psicólogo ya tenía institución y algo falla a mitad de
// camino, dos llamadas separadas podrían dejarlo sin ninguna). El código
// '23505' que se traduce más abajo ya casi nunca debería dispararse: queda
// como red de contención para el caso real de que dos superadministradores
// confirmen casi al mismo tiempo un cambio sobre la misma institución.
//
// Este servicio NO crea/edita/elimina cuentas de psicólogo (eso vive en
// el módulo `psicologos`, vía Edge Functions con service_role) — solo
// maneja la relación de asignación entre uno ya existente y una
// institución.
import { supabase } from '../../../core/api/supabaseClient';

export const psicologoInstitucionService = {
  async obtenerPsicologos() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, nombre, created_at, turno_psicologo')
      .eq('rol', 'psicologo')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Devuelve como máximo 1 fila por psicólogo (garantizado por la
  // restricción de la base, no por esta consulta). Una institución puede
  // aparecer en varias filas si es un Centro de Salud.
  async obtenerAsignaciones() {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('psicologo_id, institucion_id');

    if (error) throw error;
    return data;
  },

  // Asigna institucionId al psicólogo, de forma atómica (ver comentario
  // de cabecera): libera cualquier institución anterior del psicólogo Y,
  // si la de destino no es un Centro de Salud, la libera de cualquier otro
  // psicólogo que la tuviera, todo dentro del mismo RPC. Si de todas
  // formas ocurre un conflicto (dos superadmins confirmando casi al mismo
  // tiempo sobre la misma institución), esta función traduce el error
  // crudo de Postgres a un mensaje legible.
  async asignar(psicologoId, institucionId) {
    const { error } = await supabase.rpc('asignar_psicologo_institucion', {
      p_psicologo_id: psicologoId,
      p_institucion_id: institucionId,
    });

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'No se pudo completar la asignación porque otro superadministrador acaba de modificar esa institución. Volvé a intentarlo.'
        );
      }
      throw error;
    }
  },

  // Deja al psicólogo sin ninguna institución asignada (ej. recién
  // creado, o mientras se le reasigna).
  async desasignar(psicologoId) {
    const { error } = await supabase
      .from('psicologo_institucion')
      .delete()
      .eq('psicologo_id', psicologoId);

    if (error) throw error;
  },
};