// src/modules/instituciones/services/institucionesService.js
import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'instituciones';

export const PG_ERRORES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
};

export const institucionesService = {
  async getInstituciones() {
    const { data, error } = await supabase
      .from(TABLA)
      .select('id, nombre, codigo_registro, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createInstitucion(payload) {
    const { data, error } = await supabase
      .from(TABLA)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInstitucion(id, payload) {
    const { data, error } = await supabase
      .from(TABLA)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInstitucion(id) {
    const { error } = await supabase.from(TABLA).delete().eq('id', id);
    if (error) throw error; // 23503 si tiene psicólogos/pacientes vinculados
  },
};