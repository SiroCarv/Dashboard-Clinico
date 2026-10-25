// Acceso de solo lectura a `evaluaciones_instrumento` para el Panel
// Consolidado del superadministrador (SCRUM-56): un resultado por fila,
// con la institución y el psicólogo responsable del paciente embebidos.
// Se devuelve plano (un resultado por elemento) a propósito: los filtros
// del panel se aplican sobre resultados sueltos, y recién DESPUÉS
// TablaResultadosGlobales.jsx los junta por persona (ver
// utils/agruparResultadosPorPersona.js) — por eso cada fila trae
// `id_paciente`, la clave para saber a quién pertenece.
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
// Una institución puede tener VARIOS psicólogos (los Centros de Salud; el
// resto sigue con uno — ver AsignacionPsicologos.jsx), así que PostgREST
// embebe `psicologo_institucion` como arreglo. El resolver de abajo
// también tolera que llegue como objeto único, arreglo vacío o `null`
// (institución todavía sin psicólogo) sin romper. Cuando hay más de un
// psicólogo, `psicologoResponsable.nombre` es la lista unida con comas
// ("Ana, Luis") — así la columna y el Excel la muestran tal cual — y
// `psicologoResponsable.nombres` conserva cada nombre por separado, que
// es lo que usa el filtro de psicólogo del panel (coincide con
// cualquiera del equipo).
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
// LECTURA POR TANDAS (agregado con la exportación a Excel del superadmin):
// PostgREST devuelve como máximo un tope de filas por respuesta (por
// defecto 1,000 en Supabase) SIN avisar cuando corta, y esta tabla ya
// tenía más de 3,700 evaluaciones. Antes la consulta era una sola, así
// que tanto la tabla del panel como cualquier Excel armado desde ella
// podían quedar incompletos en silencio. Ahora se lee con
// shared/utils/leerEnTandas.js. Para que las tandas no se pisen, el orden
// es fecha + id_evaluacion (desempate).
//
// `institucion` incluye también `tipo_institucion`, usado por la columna
// "Tipo de institución" del Excel.
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
import { leerEnTandas } from '../../../shared/utils/leerEnTandas';

const SELECT_RESULTADOS =
  'id_evaluacion, id_paciente, tipo_instrumento, fecha_registro, resultado_json, alerta_activada, registrado_por_docente_id, paciente:usuarios!id_paciente(nombre, email, institucion_id, institucion:instituciones(nombre, tipo_institucion, psicologo_institucion(psicologo:usuarios!psicologo_id(nombre))), psicologo_asignado:usuarios!psicologo_asignado_id(nombre)), docente:usuarios!registrado_por_docente_id(nombre)';

// Devuelve { nombre, nombres } del/los psicólogo/s responsable/s de un
// paciente, o `null` si todavía no tiene ninguno (institución sin
// psicólogo asignado, o consultante particular sin asignación directa).
// Ver nota de cabecera: institucional resuelve vía su institución (puede
// ser más de uno), particular vía su propio `psicologo_asignado_id`.
function resolverPsicologoResponsable(paciente) {
  if (!paciente) return null;

  if (paciente.institucion_id) {
    const asignacion = paciente.institucion?.psicologo_institucion;
    const filas = Array.isArray(asignacion) ? asignacion : asignacion ? [asignacion] : [];
    const nombres = filas.map((fila) => fila?.psicologo?.nombre).filter(Boolean);
    return nombres.length > 0 ? { nombre: nombres.join(', '), nombres } : null;
  }

  const asignado = paciente.psicologo_asignado;
  return asignado?.nombre ? { nombre: asignado.nombre, nombres: [asignado.nombre] } : null;
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
   * particular — ver `resolverPsicologoResponsable` arriba, incluye a
   * todos los psicólogos de un Centro de Salud), para que el filtro y la
   * columna de psicólogo de ese panel funcionen para cualquier paciente,
   * no solo para consultantes particulares.
   */
  async obtenerResultadosGlobales() {
    const data = await leerEnTandas(
      (desde, hasta) =>
        supabase
          .from('evaluaciones_instrumento')
          .select(SELECT_RESULTADOS)
          .order('fecha_registro', { ascending: false })
          .order('id_evaluacion', { ascending: false })
          .range(desde, hasta),
      { claveUnica: (fila) => fila.id_evaluacion }
    );

    return data.map((fila) => ({
      ...fila,
      paciente: fila.paciente
        ? { ...fila.paciente, psicologoResponsable: resolverPsicologoResponsable(fila.paciente) }
        : null,
    }));
  },
};