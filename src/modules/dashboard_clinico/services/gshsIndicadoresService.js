// Acceso de solo lectura para el cálculo de "% de riesgo por módulo"
// del GSHS (SCRUM-57). Trae dos cosas por separado:
//
//   1. El catálogo de indicadores (`gshs_indicadores_riesgo`): qué
//      código de indicador pertenece a qué módulo. Es configuración, no
//      dato de paciente — se ordena por `id` porque ese orden coincide
//      con el orden real de los módulos en el instrumento (verificado
//      contra la base real; no hay una columna de "orden" explícita).
//
//   2. Las evaluaciones GSHS ya resueltas (`resultado_json` +
//      `alerta_activada`), con SOLO el nombre de la institución del
//      paciente embebido — a propósito no se trae nombre, correo ni
//      ningún otro dato identificable del paciente: esta pantalla nunca
//      necesita saber QUIÉN respondió, solo A QUÉ INSTITUCIÓN
//      pertenece, para poder agrupar. `alerta_activada` se agregó junto
//      con el gráfico de barras+dona de "con alerta / sin alerta"
//      (corrección posterior a SCRUM-57, mismo criterio de 2 categorías
//      que ya usaba useResumenFormularios.js para su propio resumen de
//      GSHS). useIndicadoresGSHS.js nunca expone `resultado_json` fila
//      por fila — solo lo usa para sumar porcentajes agregados. Ver la
//      nota actualizada en resultadosGlobalesService.js sobre qué
//      autorizó la Licenciada para GSHS (agregados por módulo sí,
//      resultado individual de un estudiante no).
//
// Mismo caso de FK ambigua que resultadosGlobalesService.js:
// `evaluaciones_instrumento` tiene 3 llaves foráneas hacia `usuarios`,
// así que hay que decirle a PostgREST cuál usar con `!id_paciente`.
//
// RLS: `evaluaciones_instrumento` depende de la política ya existente
// `instrumento_select` (ya cubre institución propia del psicólogo +
// superadmin). `gshs_indicadores_riesgo` tenía RLS activado sin ninguna
// política (0 filas para cualquiera, incluido superadmin) hasta el
// script SQL de esta historia — ver el script entregado junto con este
// archivo.
import { supabase } from '../../../core/api/supabaseClient';

export const gshsIndicadoresService = {
  async obtenerCatalogoIndicadores() {
    const { data, error } = await supabase
      .from('gshs_indicadores_riesgo')
      .select('modulo, indicador_codigo')
      .order('id');

    if (error) throw error;
    return data ?? [];
  },

  async obtenerEvaluacionesGSHS() {
    const { data, error } = await supabase
      .from('evaluaciones_instrumento')
      .select(
        'id_evaluacion, resultado_json, alerta_activada, paciente:usuarios!id_paciente(institucion:instituciones(nombre))'
      )
      .eq('tipo_instrumento', 'GSHS');

    if (error) throw error;
    return data ?? [];
  },
};