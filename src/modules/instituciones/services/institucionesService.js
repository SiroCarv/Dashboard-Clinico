import { supabase } from '../../../core/api/supabaseClient';

export const institucionesService = {
  // Obtener todas las instituciones
async getInstituciones() {
  const { data, error } = await supabase
    .from('instituciones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
},

  // Crear una nueva institución
  async createInstitucion(institucion) {
    const { data, error } = await supabase
      .from('instituciones')
      .insert([institucion])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Actualizar una institución existente
  async updateInstitucion(id, institucion) {
    const { data, error } = await supabase
      .from('instituciones')
      .update(institucion)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Eliminar (Opcional, a veces es mejor solo desactivar, pero te dejo el CRUD completo)
  async deleteInstitucion(id) {
    const { error } = await supabase
      .from('instituciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};