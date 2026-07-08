import { supabase } from '../../../core/api/supabaseClient';

export const institucionesService = {
  // Obtener todas las instituciones
  async obtenerInstituciones() {
    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Crear una nueva institución
  async crearInstitucion(institucion) {
    const { data, error } = await supabase
      .from('instituciones')
      .insert([institucion])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Actualizar una institución existente
  async actualizarInstitucion(id, institucion) {
    const { data, error } = await supabase
      .from('instituciones')
      .update(institucion)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Eliminar una institución
  async eliminarInstitucion(id) {
    const { error } = await supabase
      .from('instituciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Verificar si un código existe y obtener la institución
  async validarCodigo(codigo) {
    const { data, error } = await supabase
      .from('instituciones')
      .select('id, nombre')
      .eq('codigo_registro', codigo.trim().toUpperCase())
      .maybeSingle(); // Retorna null si no lo encuentra en lugar de lanzar una excepción

    if (error) throw error;
    return data;
  }
};