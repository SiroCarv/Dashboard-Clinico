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

  /**
   * Verifica si el paciente autenticado ya registró una evaluación.
   * Solo se seleccionan id_evaluacion y fecha_registro: el diagnóstico y el
   * puntaje son información clínica que el paciente no debe ver por esta vía
   * (el psicólogo es quien la revisa, en el Dashboard de Historiales).
   */
  async obtenerEvaluacionPropia(idPaciente) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('id_evaluacion, fecha_registro')
      .eq('id_paciente', idPaciente)
      .order('fecha_registro', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Recupera el historial de evaluaciones visible para el psicólogo autenticado.
   * No recibe ningún filtro de institución/psicólogo por parámetro: la
   * política RLS "historial_select_psicologo" es la que restringe las filas
   * devueltas a los pacientes de las instituciones asignadas a auth.uid().
   */
  async obtenerHistorial() {
    const { data, error } = await supabase
      .from(TABLA)
      .select(`
        id_evaluacion,
        fecha_registro,
        puntaje_total,
        diagnostico,
        alerta_activada,
        paciente:usuarios!historial_evaluaciones_id_paciente_fkey (
          email,
          nombre,
          institucion:instituciones (
            nombre
          )
        )
      `)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Se suscribe en tiempo real a nuevas filas insertadas en
   * `historial_evaluaciones` (Supabase Realtime · Postgres Changes).
   *
   * No requiere ningún filtro por institución/psicólogo: Postgres Changes
   * evalúa cada fila contra las políticas RLS de SELECT de la tabla usando
   * el JWT del cliente suscrito, exactamente igual que `obtenerHistorial()`.
   * Un psicólogo solo recibirá el evento si "historial_select_psicologo" ya
   * le da acceso de lectura a esa fila (paciente de una institución que
   * tiene asignada); un paciente solo vería la suya propia.
   *
   * El payload de Postgres Changes trae únicamente las columnas crudas de
   * la fila (sin los joins de `obtenerHistorial`), por lo que el callback
   * recibe la fila cruda — el hook que consume esto decide si le alcanza
   * o si prefiere recargar el listado completo para tener el join.
   *
   * @param {(filaNueva: object) => void} alRecibirEvaluacion
   * @returns {() => void} función para cancelar la suscripción (llamar en el cleanup del efecto)
   */
  suscribirseANuevasEvaluaciones(alRecibirEvaluacion) {
    const canal = supabase
      .channel('historial_evaluaciones-nuevas')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLA },
        (payload) => alRecibirEvaluacion(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  },
};