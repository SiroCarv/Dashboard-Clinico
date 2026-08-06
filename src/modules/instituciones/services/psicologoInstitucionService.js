// Acceso a la tabla puente `psicologo_institucion` (relación
// muchos-a-muchos) y al listado de cuentas con rol 'psicologo' — usado
// por AsignacionPsicologos.jsx para armar la matriz de "qué psicólogo
// está asignado a qué institución".
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

  async obtenerAsignaciones() {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('psicologo_id, institucion_id');

    if (error) throw error;
    return data;
  },

  async asignar(psicologoId, institucionId) {
    const { error } = await supabase
      .from('psicologo_institucion')
      .insert([{ psicologo_id: psicologoId, institucion_id: institucionId }]);

    if (error) throw error;
  },

  async remover(psicologoId, institucionId) {
    const { error } = await supabase
      .from('psicologo_institucion')
      .delete()
      .eq('psicologo_id', psicologoId)
      .eq('institucion_id', institucionId);

    if (error) throw error;
  },
};
