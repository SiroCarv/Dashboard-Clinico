import { supabase } from '../../../core/api/supabaseClient';

export const psicologoInstitucionService = {
  // 1. Obtener solo usuarios que sean psicólogos
  getPsicologos: async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, rol, created_at')
      .eq('rol', 'psicologo')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener psicólogos:', error);
      throw error;
    }
    return data || [];
  },

  // 2. Obtener la lista de quién está asignado a dónde
  getAsignaciones: async () => {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('*');

    if (error) {
      console.error('Error al obtener asignaciones:', error);
      throw error;
    }
    return data || [];
  },

  // 3. Asignar un psicólogo a un colegio
  asignar: async (psicologo_id, institucion_id) => {
    const { error } = await supabase
      .from('psicologo_institucion')
      .insert([{ psicologo_id, institucion_id }]);

    if (error) throw error;
    return true;
  },

  // 4. Quitarle el acceso a un colegio
  remover: async (psicologo_id, institucion_id) => {
    const { error } = await supabase
      .from('psicologo_institucion')
      .delete()
      .match({ psicologo_id, institucion_id });

    if (error) throw error;
    return true;
  }
};