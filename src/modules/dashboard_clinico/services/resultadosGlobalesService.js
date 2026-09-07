// Acceso de solo lectura a `evaluaciones_instrumento` para el Panel
// Consolidado del superadministrador (SCRUM-56): un resultado por fila,
// con la institución y el psicólogo responsable del paciente embebidos.
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
// CORRECCIÓN — "psicólogo asignado" no servía para pacientes
// institucionales: `psicologo_asignado_id` en `usuarios` solo se llena
// para un Consultante particular (paciente sin institución, ver
// pacientesService.js). Para un paciente institucional (colegios, la
// inmensa mayoría de los casos) ese campo siempre es NULL — el psicólogo
// responsable se determina por `institución → psicologo_institucion →
// psicólogo` (ver AsignacionPsicologos.jsx, módulo `instituciones`).
// Verificado contra la base real: el filtro de psicólogo del panel
// nunca encontraba coincidencias para pacientes de colegio porque
// comparaba contra un campo que nunca se llena para ese caso. Por eso
// acá se agrega el embed anidado `institucion → psicologo_institucion →
// psicólogo` y se resuelve con `resolverPsicologoResponsable()` abajo:
// institucional → psicólogo de su institución; particular → su
// `psicologo_asignado_id` directo. El resultado queda en
// `paciente.psicologoResponsable`, que es lo único que deben leer
// PanelConsolidadoSuperadmin.jsx (filtro) y TablaResultadosGlobales.jsx
// (columna) — no usar `psicologo_asignado` directo en ningún lado nuevo.
//
// `psicologo_institucion` tiene restricción UNIQUE(institucion_id) (una
// institución, a lo sumo un psicólogo — ver AsignacionPsicologos.jsx),
// así que PostgREST embebe esa relación como objeto único; por las dudas
// (versión de PostgREST, o una institución todavía sin psicólogo) el
// resolver de abajo tolera que llegue como objeto, arreglo vacío o
// `null` sin romper.
//
// SCRUM-60 — Detalle de casos registrados por docente: se agrega
// `registrado_por_docente_id` en crudo (para que el panel decida
// "Estudiante" vs "Docente" sin adivinar, mismo criterio que ya usa
// pacientesService.js para armar `tipoPersona` en SCRUM-53) y un embed
// nuevo, hermano de `paciente`, `docente:usuarios!registrado_por_docente_id(nombre)`
// — es una FK directa de esta tabla hacia `usuarios`, no anidada dentro
// del paciente, así que necesita su propio alias y su propio sufijo de
// desambiguación. Si el resultado fue autoenviado por el estudiante,
// `registrado_por_docente_id` es NULL y `docente` llega como `null`.
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
// entre muchos estudiantes (ver la pestaña GSHS de
// dashboard_clinico/pages/IndicadoresGSHS.jsx y la pestaña Gráficas de
// PanelConsolidadoSuperadmin.jsx), pero la fila individual sigue sin
// poder mostrarse, ni siquiera al superadmin. Quien consuma ESTE
// servicio en particular (listado de resultados fila por fila) debe
// seguir ignorando `resultado_json` cuando `tipo_instrumento === 'GSHS'`
// y usar solo `alerta_activada` (mismo criterio que
// InformeConsolidadoPaciente.jsx ya aplica) — ver
// TablaResultadosGlobales.jsx. El cálculo agregado por módulo NO usa
// este servicio; tiene el suyo propio (gshsIndicadoresService.js), que
// trae `resultado_json` sin ningún dato identificable del paciente.
import { supabase } from '../../../core/api/supabaseClient';

// Devuelve { nombre } del psicólogo responsable de un paciente, o `null`
// si todavía no tiene ninguno (institución sin psicólogo asignado, o
// consultante particular sin asignación directa). Ver nota de cabecera:
// institucional resuelve vía su institución, particular vía su propio
// `psicologo_asignado_id`.
function resolverPsicologoResponsable(paciente) {
  if (!paciente) return null;

  if (paciente.institucion_id) {
    const asignacion = paciente.institucion?.psicologo_institucion;
    const fila = Array.isArray(asignacion) ? asignacion[0] : asignacion;
    return fila?.psicologo ?? null;
  }

  return paciente.psicologo_asignado ?? null;
}

export const resultadosGlobalesService = {
  /**
   * Trae TODOS los resultados de evaluaciones visibles para el
   * superadministrador (todas las instituciones y psicólogos), del más
   * reciente al más antiguo. Cada fila incluye `registrado_por_docente_id`
   * y, cuando corresponde, `docente.nombre` (SCRUM-60), para que
   * PanelConsolidadoSuperadmin.jsx pueda distinguir entre autoenvío del
   * estudiante y registro hecho por un docente. También incluye
   * `paciente.psicologoResponsable`, ya resuelto (institucional o
   * particular — ver `resolverPsicologoResponsable` arriba), para que el
   * filtro y la columna de psicólogo de ese panel funcionen para
   * cualquier paciente, no solo para consultantes particulares.
   */
  async obtenerResultadosGlobales() {
    const { data, error } = await supabase
      .from('evaluaciones_instrumento')
      .select(
        'id_evaluacion, tipo_instrumento, fecha_registro, resultado_json, alerta_activada, registrado_por_docente_id, paciente:usuarios!id_paciente(nombre, email, institucion_id, institucion:instituciones(nombre, psicologo_institucion(psicologo:usuarios!psicologo_id(nombre))), psicologo_asignado:usuarios!psicologo_asignado_id(nombre)), docente:usuarios!registrado_por_docente_id(nombre)'
      )
      .order('fecha_registro', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((fila) => ({
      ...fila,
      paciente: fila.paciente
        ? { ...fila.paciente, psicologoResponsable: resolverPsicologoResponsable(fila.paciente) }
        : null,
    }));
  },
};