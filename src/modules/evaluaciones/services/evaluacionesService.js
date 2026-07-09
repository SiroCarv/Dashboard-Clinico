import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'historial_evaluaciones';

export const evaluacionesService = {
  /**
   * Guarda el formulario respondido por el paciente en formato JSON.
   *
   * Nota de alcance: esta historia ("Recepción de evaluaciones") solo
   * captura y persiste las respuestas crudas. El cálculo de
   * `puntaje_total`, `diagnostico` y `alerta_activada` se implementa en
   * la historia "Cálculo de diagnóstico" (siguiente entrega del sprint).
   */
  async enviarEvaluacion({ idPaciente, respuestasJson }) {
    const { data, error } = await supabase
      .from(TABLA)
      .insert([
        {
          id_paciente: idPaciente,
          respuestas_json: respuestasJson,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};