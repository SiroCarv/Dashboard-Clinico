import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'historial_evaluaciones';

export const evaluacionesService = {
  /**
   * Guarda el formulario respondido por el paciente en formato JSON.
   * solo captura y persiste las respuestas crudas.
   */
  async enviarEvaluacion({ idPaciente, respuestasJson }) {
    const { error } = await supabase.from(TABLA).insert([
      {
        id_paciente: idPaciente,
        respuestas_json: respuestasJson,
      },
    ]);

    if (error) throw error;
  },
};