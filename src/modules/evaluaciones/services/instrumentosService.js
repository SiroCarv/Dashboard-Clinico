import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'evaluaciones_instrumento';

export const instrumentosService = {
  async enviarRespuestas({ idPaciente, tipoInstrumento, respuestasJson }) {
    const { error } = await supabase.from(TABLA).insert([
      {
        id_paciente: idPaciente,
        tipo_instrumento: tipoInstrumento,
        respuestas_json: respuestasJson,
      },
    ]);
    if (error) throw error;
  },

  async obtenerPropio(idPaciente, tipoInstrumento) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('id_evaluacion, fecha_registro')
      .eq('id_paciente', idPaciente)
      .eq('tipo_instrumento', tipoInstrumento)
      .order('fecha_registro', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};