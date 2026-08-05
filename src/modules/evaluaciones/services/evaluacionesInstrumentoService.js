import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'evaluaciones_instrumento';

// Requiere la migración "006_consentimiento_y_envio_individual.sql":
// otorga los GRANTs que le faltaban a esta tabla (ya tenía RLS pero no
// GRANT, así que hoy fallaría en cualquier insert/select real) y agrega
// el trigger que calcula `alerta_activada` en el servidor para GSHS.
export const evaluacionesInstrumentoService = {
  /**
   * Envía las respuestas de UN instrumento puntual. `respuestas` debe ser
   * un array de objetos { modulo, numero, valor } — el trigger del lado de
   * la base de datos busca ahí, por nombre exacto de módulo y número, las
   * 3 preguntas de riesgo suicida del GSHS para calcular `alerta_activada`
   * (nunca se confía en un valor de alerta calculado en el cliente).
   */
  async enviarInstrumento({ idPaciente, tipoInstrumento, respuestas }) {
    const { error } = await supabase.from(TABLA).insert([
      {
        id_paciente: idPaciente,
        tipo_instrumento: tipoInstrumento,
        respuestas_json: respuestas,
      },
    ]);

    if (error) {
      // 23505 = unique_violation: ya existe un envío previo de este mismo
      // instrumento para este paciente (constraint agregada en la
      // migración). Se traduce a un mensaje que la UI pueda mostrar tal
      // cual, sin exponer el nombre de la restricción.
      if (error.code === '23505') {
        throw new Error('YA_ENVIADO');
      }
      throw error;
    }
  },

  /**
   * Indica si el paciente autenticado ya envió un instrumento puntual, y
   * cuándo. Se usa para deshabilitar el formulario y no dejar que se
   * envíe dos veces (la restricción real vive en la base de datos; esto
   * es solo para no mostrarle el formulario en blanco de nuevo).
   */
  async obtenerEnvioPropio(idPaciente, tipoInstrumento) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('id_evaluacion, fecha_registro, alerta_activada')
      .eq('id_paciente', idPaciente)
      .eq('tipo_instrumento', tipoInstrumento)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Recupera todos los envíos de un paciente puntual, para el "Informe
   * Consolidado de Pruebas por Paciente" (SCRUM-31) del panel del
   * psicólogo. La política RLS "instrumento_select_psicologo" es quien
   * decide si estas filas son visibles para auth.uid() — si el psicólogo
   * fuerza el acceso a un paciente fuera de sus instituciones, esto
   * simplemente devuelve un arreglo vacío.
   */
  async obtenerInstrumentosDePaciente(idPaciente) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('id_evaluacion, tipo_instrumento, fecha_registro, respuestas_json, alerta_activada')
      .eq('id_paciente', idPaciente)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
};
