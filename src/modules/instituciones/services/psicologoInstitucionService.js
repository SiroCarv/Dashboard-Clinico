// Acceso a la tabla `psicologo_institucion` y al listado de cuentas con
// rol 'psicologo' — usado por AsignacionPsicologos.jsx para saber a qué
// institución (una sola) está vinculado cada psicólogo.
//
// Desde la migración 006 la tabla tiene una restricción UNIQUE(psicologo_id)
// en la base: un psicólogo ya no puede tener más de una fila.
//
// Restricción de un psicólogo por institución (migración 007): la tabla
// ahora también tiene UNIQUE(institucion_id) — una institución no puede
// tener más de un psicólogo asignado. Con las dos restricciones activas,
// `psicologo_institucion` termina siendo una relación 1 a 1 entre
// psicólogos y instituciones (a lo sumo una fila por cada uno de los dos).
//
// Por esto, asignar() ya no hace DELETE + INSERT como dos llamadas
// separadas: si el psicólogo ya tenía institución y la institución nueva
// falla por estar ocupada, un DELETE+INSERT en dos pasos dejaría al
// psicólogo sin ninguna institución (el DELETE ya se habría aplicado
// antes de que el INSERT fallara). En su lugar, asignar() llama al RPC
// `asignar_psicologo_institucion`, que hace ambos pasos dentro de una
// sola función de base de datos: si el INSERT viola la restricción, toda
// la operación se revierte y el psicólogo conserva su institución
// anterior. El código '23505' (unique_violation) de Postgres se traduce
// acá a un mensaje en español entendible para quien usa el panel.
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

  // Reemplaza la institución del psicólogo por institucionId, de forma
  // atómica (ver comentario de cabecera). Si la institución elegida ya
  // tiene otro psicólogo asignado, el RPC revierte todo y esta función
  // lanza un error con mensaje amigable en vez del error crudo de Postgres.
  async asignar(psicologoId, institucionId) {
    const { error } = await supabase.rpc('asignar_psicologo_institucion', {
      p_psicologo_id: psicologoId,
      p_institucion_id: institucionId,
    });

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'Esa institución ya tiene un psicólogo asignado. Retira esa asignación antes de asignar a otro.'
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