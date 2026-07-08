import { supabase } from '../../../core/api/supabaseClient';

export const psicologoInstitucionService = {
  // Todos los usuarios con rol 'psicologo'
  async getPsicologos() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('rol', 'psicologo')
      .order('email', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Todas las asignaciones actuales (psicologo_id + institucion_id)
  async getAsignaciones() {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('id, psicologo_id, institucion_id');

    if (error) throw error;
    return data;
  },

  // Asignar una institución a un psicólogo
  async asignar(psicologoId, institucionId) {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .insert([{ psicologo_id: psicologoId, institucion_id: institucionId }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Quitar una institución de un psicólogo
  async desasignar(psicologoId, institucionId) {
    const { error } = await supabase
      .from('psicologo_institucion')
      .delete()
      .eq('psicologo_id', psicologoId)
      .eq('institucion_id', institucionId);

    if (error) throw error;
    return true;
  },
};