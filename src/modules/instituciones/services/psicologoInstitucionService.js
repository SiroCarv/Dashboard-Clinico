// Acceso a la tabla `psicologo_institucion` y al listado de cuentas con
// rol 'psicologo' — usado por AsignacionPsicologos.jsx para saber a qué
// institución (una sola) está vinculado cada psicólogo.
//
// Desde la migración 006 la tabla tiene una restricción UNIQUE(psicologo_id)
// en la base: un psicólogo ya no puede tener más de una fila. Por eso
// asignar() no hace un INSERT directo (fallaría por la restricción si el
// psicólogo ya tenía institución) — primero borra cualquier asignación
// previa y recién después inserta la nueva, como un reemplazo atómico
// desde la perspectiva del frontend.
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

  // Reemplaza la institución del psicólogo por institucionId. Si no tenía
  // ninguna, el DELETE simplemente no borra nada y sigue con el INSERT.
  async asignar(psicologoId, institucionId) {
    const { error: errorBorrado } = await supabase
      .from('psicologo_institucion')
      .delete()
      .eq('psicologo_id', psicologoId);

    if (errorBorrado) throw errorBorrado;

    const { error: errorInsercion } = await supabase
      .from('psicologo_institucion')
      .insert([{ psicologo_id: psicologoId, institucion_id: institucionId }]);

    if (errorInsercion) throw errorInsercion;
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