import { supabase } from '../../../core/api/supabaseClient'; 

export const institucionesService = {
  // 1. Obtener todas las instituciones (El nombre exacto que busca PanelMaestro.jsx)
  getInstituciones: async () => {
    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener instituciones:', error.message);
      throw error;
    }
    return data || [];
  },

  // 2. Crear una nueva institución
  crearInstitucion: async (institucion) => {
    const { data, error } = await supabase
      .from('instituciones')
      .insert([institucion])
      .select();

    if (error) throw error;
    return data[0];
  },

  // 3. Actualizar una institución existente
  actualizarInstitucion: async (id, institucion) => {
    const { data, error } = await supabase
      .from('instituciones')
      .update(institucion)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // 4. Eliminar una institución
  eliminarInstitucion: async (id) => {
    const { error } = await supabase
      .from('instituciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // 5. Verificar si un código existe (Útil para la pantalla de Registro de pacientes)
  validarCodigo: async (codigo) => {
    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .eq('codigo_registro', codigo)
      .single();

    if (error) throw error;
    return data;
  }
};