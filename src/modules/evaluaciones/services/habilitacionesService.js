// Habilitación de formularios por institución. El psicólogo/a decide qué
// formularios pueden responder los estudiantes de su institución; sin fila
// en `formularios_habilitados` el formulario está deshabilitado. Quién
// puede leer o cambiar cada fila lo decide la RLS (ver
// supabase/paso2_habilitacion_formularios.sql), no este archivo.
import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'formularios_habilitados';

export const habilitacionesService = {
  /**
   * Tipos de formulario habilitados para el estudiante autenticado. La RLS
   * solo le devuelve filas de SU institución, así que no hace falta
   * pasarle ningún id.
   */
  async listarHabilitadosPropios() {
    const { data, error } = await supabase.from(TABLA).select('tipo_instrumento').eq('habilitado', true);

    if (error) throw error;
    return (data ?? []).map((fila) => fila.tipo_instrumento);
  },

  /**
   * Institución del psicólogo/a autenticado/a (un psicólogo tiene una sola
   * institución a la vez). Devuelve null si todavía no tiene ninguna.
   */
  async obtenerInstitucionPropia() {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('institucion_id, institucion:instituciones(nombre)')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return { id: data.institucion_id, nombre: data.institucion?.nombre ?? '' };
  },

  /** Filas de habilitación de una institución: [{ tipo_instrumento, habilitado }]. */
  async listarDeInstitucion(institucionId) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('tipo_instrumento, habilitado')
      .eq('institucion_id', institucionId);

    if (error) throw error;
    return data ?? [];
  },

  /** Habilita o deshabilita un formulario para toda la institución. */
  async cambiarEstado(institucionId, tipoInstrumento, habilitado) {
    const { error } = await supabase
      .from(TABLA)
      .upsert(
        [{ institucion_id: institucionId, tipo_instrumento: tipoInstrumento, habilitado }],
        { onConflict: 'institucion_id,tipo_instrumento' }
      );

    if (error) throw error;
  },
};
