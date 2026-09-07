// Acceso a la tabla `psicologo_institucion` y al listado de cuentas con
// rol 'psicologo' — usado por AsignacionPsicologos.jsx para saber a qué
// institución (una sola) está vinculado cada psicólogo.
//
// Desde la migración 006 la tabla tiene una restricción UNIQUE(psicologo_id)
// en la base: un psicólogo ya no puede tener más de una fila.
//
// Restricción de un psicólogo por institución (migración 007): la tabla
// también tiene UNIQUE(institucion_id) — una institución no puede tener
// más de un psicólogo asignado al mismo tiempo. Con las dos
// restricciones activas, `psicologo_institucion` es una relación 1 a 1
// entre psicólogos y instituciones (a lo sumo una fila por cada uno de
// los dos), sin cambios en esto.
//
// Reasignación de institución entre psicólogos (migración 008 —
// corrige el bloqueo de SCRUM-73 sin editar esa historia cerrada): antes,
// si la institución elegida ya estaba ocupada por otro psicólogo, el
// RPC fallaba entero y el frontend solo podía mostrar el error. Ahora
// `asignar_psicologo_institucion` además desvincula, dentro de la misma
// transacción, a cualquier OTRO psicólogo que tuviera esa institución
// antes de insertar la fila nueva — el reemplazo es intencional:
// AsignacionPsicologos.jsx ya avisa y pide confirmación explícita antes
// de llamar a este método cuando eso va a pasar (ver su comentario de
// cabecera). asignar() sigue llamando al mismo RPC (no dos pasos
// DELETE+INSERT separados desde el cliente, por la misma razón de
// siempre: si el psicólogo ya tenía institución y algo falla a mitad de
// camino, dos llamadas separadas podrían dejarlo sin ninguna). El código
// '23505' (unique_violation) que se traduce más abajo ya casi nunca
// debería dispararse por este motivo — queda como red de contención para
// el caso real de que dos superadministradores confirmen casi al mismo
// tiempo un cambio sobre la misma institución.
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
      .select('id, email, nombre, created_at')
      .eq('rol', 'psicologo')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Devuelve como máximo 1 fila por psicólogo (garantizado por la
  // restricción de la base, no por esta consulta).
  async obtenerAsignaciones() {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('psicologo_id, institucion_id');

    if (error) throw error;
    return data;
  },

  // Asigna institucionId al psicólogo, de forma atómica (ver comentario
  // de cabecera): libera cualquier institución anterior del psicólogo Y
  // libera la institución de destino de cualquier otro psicólogo que la
  // tuviera, todo dentro del mismo RPC. Si de todas formas ocurre un
  // conflicto (dos superadmins confirmando casi al mismo tiempo sobre la
  // misma institución), esta función traduce el error crudo de Postgres
  // a un mensaje legible.
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