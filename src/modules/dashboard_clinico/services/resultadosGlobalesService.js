// Acceso de solo lectura a `evaluaciones_instrumento` para el Panel
// Consolidado del superadministrador (SCRUM-56): un resultado por fila,
// con la institución y el psicólogo asignado del paciente embebidos.
// Igual que pacientesService.js, este archivo nunca filtra "manualmente"
// por institución/psicólogo en el cliente — depende enteramente de la
// política RLS "instrumento_select" (que ya incluye `is_superadmin()`)
// para decidir qué filas son visibles. Los filtros de
// PanelConsolidadoSuperadmin.jsx se aplican en memoria sobre el listado
// ya cargado, mismo criterio que Dashboard.jsx usa para su filtro de
// institución.
//
// IMPORTANTE — mismo caso de FKs ambiguas que pacientesService.js:
// `evaluaciones_instrumento` tiene 3 llaves foráneas hacia `usuarios`
// (id_paciente, registrado_por_docente_id, psicologo_revisor_id), así
// que hay que decirle a PostgREST cuál usar con `!id_paciente`. Dentro
// de ese embed, `psicologo_asignado_id` es a su vez una FK de `usuarios`
// hacia sí misma (autorreferencia), y también necesita su propio sufijo
// de desambiguación (`!psicologo_asignado_id`) para no chocar con
// `PGRST201`.
//
// `email` se trae junto a `nombre` únicamente como respaldo para
// `obtenerNombreMostrado()` (shared/utils/identidadUsuario.js): hay
// cuentas reales sin `nombre` cargado todavía (verificado contra la
// base real).
//
// GSHS — DECISIÓN DEL CLIENTE (actualizada en SCRUM-57): este servicio
// SÍ trae `resultado_json` para todos los tipos de instrumento (es más
// simple que excluirlo con una consulta condicional), pero para GSHS ese
// campo contiene los ~53 indicadores de prevalencia por módulo de UN
// estudiante puntual — la Licenciada autorizó mostrar esto agregado
// entre muchos estudiantes (ver dashboard_clinico/pages/IndicadoresGSHS.jsx
// y IndicadoresGSHSSuperadmin.jsx), pero la fila individual sigue sin
// poder mostrarse, ni siquiera al superadmin. Quien consuma ESTE
// servicio en particular (listado de resultados fila por fila) debe
// seguir ignorando `resultado_json` cuando `tipo_instrumento === 'GSHS'`
// y usar solo `alerta_activada` (mismo criterio que
// InformeConsolidadoPaciente.jsx ya aplica) — ver
// TablaResultadosGlobales.jsx. El cálculo agregado por módulo NO usa
// este servicio; tiene el suyo propio (gshsIndicadoresService.js), que
// trae `resultado_json` sin ningún dato identificable del paciente.
import { supabase } from '../../../core/api/supabaseClient';

export const resultadosGlobalesService = {
  /**
   * Trae TODOS los resultados de evaluaciones visibles para el
   * superadministrador (todas las instituciones y psicólogos), del más
   * reciente al más antiguo.
   */
  async obtenerResultadosGlobales() {
    const { data, error } = await supabase
      .from('evaluaciones_instrumento')
      .select(
        'id_evaluacion, tipo_instrumento, fecha_registro, resultado_json, alerta_activada, paciente:usuarios!id_paciente(nombre, email, institucion:instituciones(nombre), psicologo_asignado:usuarios!psicologo_asignado_id(nombre))'
      )
      .order('fecha_registro', { ascending: false });

    if (error) throw error;

    return data ?? [];
  },
};