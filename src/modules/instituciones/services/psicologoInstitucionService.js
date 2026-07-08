import { supabase } from '../../../core/api/supabaseClient';

export const psicologoInstitucionService = {
  // 1. OBTENER SOLO PSICÓLOGOS (Sin pedir created_at)
  obtenerPsicologos: async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, rol') 
      .eq('rol', 'psicologo'); 
      // Eliminamos el .order('created_at') para evitar el error 400

    if (error) {
      console.error("Error al obtener psicólogos:", error);
      throw error;
    }
    return data || [];
  },

  // 2. OBTENER ASIGNACIONES ACTUALES
  obtenerAsignaciones: async () => {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('*');

    if (error) {
      console.error("Error al obtener asignaciones:", error);
      throw error;
    }
    return data || [];
  },

  // 3. ASIGNAR O DESASIGNAR
  toggleAsignacion: async (psicologo_id, institucion_id, estaAsignado) => {
    if (estaAsignado) {
      // Si ya está, lo quitamos
      const { error } = await supabase
        .from('psicologo_institucion')
        .delete()
        .match({ psicologo_id, institucion_id });
      if (error) throw error;
    } else {
      // Si no está, lo agregamos
      const { error } = await supabase
        .from('psicologo_institucion')
        .insert([{ psicologo_id, institucion_id }]);
      if (error) throw error;
    }
  }
};