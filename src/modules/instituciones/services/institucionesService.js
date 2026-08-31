// CRUD de la tabla `instituciones`, consumido por PanelMaestro.jsx (a
// través de InstitucionList/InstitucionModal). Los nombres de método acá
// (createInstitucion, updateInstitucion, deleteInstitucion) deben
// coincidir EXACTO con lo que llaman los componentes — este proyecto ya
// tuvo bugs reales por un desfase de nombres entre este archivo y la UI,
// así que cualquier cambio de nombre acá exige revisar PanelMaestro.jsx
// en el mismo commit.
import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'instituciones';

export const institucionesService = {
  async getInstituciones() {
    const { data, error } = await supabase
      .from(TABLA)
      // tipo_institucion se incluye para que InstitucionModal pueda
      // preseleccionar el tipo correcto al editar una institución
      // existente (antes no se traía porque nada la usaba).
      .select('id, nombre, tipo_institucion, codigo_registro, created_at')
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
    if (error) throw error; // 23503 si tiene psicólogos/pacientes vinculados (FK sin ON DELETE CASCADE, a propósito)
  },
};