// Acceso de solo lectura a `usuarios` desde el punto de vista del
// psicólogo: listar a sus pacientes y ver el detalle completo de uno.
// Ambos métodos dependen enteramente de las políticas RLS del lado del
// servidor para decidir qué filas son visibles — este archivo nunca
// filtra "manualmente" por institución en el cliente.
//
// IMPORTANTE — embed explícito por nombre de columna:
// `evaluaciones_instrumento` tiene 3 llaves foráneas hacia `usuarios`
// (id_paciente, registrado_por_docente_id, psicologo_revisor_id,
// agregadas en SCRUM-51). Con una sola FK, PostgREST podía adivinar la
// relación sola; con 3, hay que decirle cuál usar
// (`evaluaciones_instrumento!id_paciente`) o rechaza la consulta entera
// con un error de relación ambigua (PGRST201) — bug real detectado y
// corregido en esta sesión: rompía el listado completo del Dashboard.
//
// Persona Particular (sprint "Persona Particular"): `obtenerPacientesPropios`
// ahora trae también `rol = 'persona_particular'`, no solo `'paciente'`
// — requiere la migración de RLS de esta historia (`usuarios_select`
// dejaba pasar únicamente `rol = 'paciente'` hacia un psicólogo; sin
// esa migración, esta consulta simplemente no devolvería ninguna
// Persona Particular, sin ningún error visible). Se agrega `rol` al
// select para que Dashboard.jsx pueda separar Estudiantes de Personas
// Particulares en 2 pestañas (historia "Pestañas de Estudiantes y
// Personas Particulares").
import { supabase } from '../../../core/api/supabaseClient';

export const pacientesService = {
  /**
   * Listado para la tabla del Dashboard y para el panel de indicadores
   * ("Conteo de formularios completados" / "Filtros de conteo por
   * perfil"). Usa la política RLS "usuarios_select": solo devuelve
   * pacientes de las instituciones asignadas al psicólogo autenticado, o
   * asignados directamente a él (Consultante particular vía
   * `psicologo_asignado_id`) — o ninguno, si el psicólogo fuerza el
   * acceso a otro. Un Consultante particular (institucion_id = NULL)
   * nunca trae `institucion` — ver la nota de RLS en
   * shared/utils/identidadUsuario.js.
   *
   * Además de lo que ya usaba la tabla, ahora también trae `genero`,
   * `turno` y `fecha_nacimiento` (filtros del panel de indicadores) y,
   * por cada evaluación enviada, `tipo_instrumento`, `fecha_registro`,
   * `resultado_json` y `registrado_por_docente_id` (antes solo se traía
   * `alerta_activada`).
   * `resultado_json` es el mismo objeto `{ puntaje_total, categoria }`
   * que ya usa InformeConsolidadoPaciente.jsx para Clima de Aula — acá
   * se usa para armar el gráfico de distribución por categoría (para
   * GSHS siempre viene null, no genera categoría — ver nota en
   * evaluaciones/data/gshsData.js). Se devuelven varias formas derivadas
   * del mismo dato para no romper a quien ya consumía esto:
   *  - `evaluaciones`: el arreglo completo, para que
   *    useResumenFormularios arme los gráficos y filtre por instrumento/
   *    fecha de envío.
   *  - `tieneAlertaActiva`: el mismo booleano reducido de siempre, para
   *    que TablaPacientes.jsx siga funcionando sin cambios.
   *  - `tipoPersona` ('estudiante' | 'docente' | null): quién originó el
   *    registro (SCRUM-53). Se usa `registrado_por_docente_id` — no NULL
   *    significa que un docente registró el caso en nombre del alumno
   *    (ver casos_docente/services/casosDocenteService.js); NULL
   *    significa autoenvío del propio estudiante. Se usa `.some(...)` en
   *    vez de exigir que TODAS las evaluaciones coincidan porque, aunque
   *    hoy la función `registrar_caso_docente` impide que un mismo
   *    alumno mezcle ambos orígenes (verificado contra la base real),
   *    esta lógica no depende de esa garantía para no romper si algún
   *    día cambia. `null` (sin evaluaciones) significa que la persona
   *    aún no tiene ningún registro — no encaja en ninguna de las dos
   *    categorías, así que el filtro de Dashboard.jsx la excluye cuando
   *    se elige "Estudiante" o "Docente" específicamente. Para
   *    `persona_particular` esto queda siempre en `null` (no aplica el
   *    concepto de "quién originó el registro" — siempre es autoenvío).
   *  - `rol`: 'paciente' | 'persona_particular' — NUEVO, para que
   *    Dashboard.jsx pueda separarlos en pestañas distintas.
   * El embed respeta la misma política RLS "instrumento_select" de esa
   * tabla, así que nunca expone datos de pacientes fuera de las
   * instituciones (o asignación directa) del psicólogo. El sufijo
   * `!id_paciente` solo desambigua CUÁL relación usar — no cambia qué
   * filas son visibles, eso lo sigue decidiendo la RLS.
   */
  async obtenerPacientesPropios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select(
        'id, rol, nombre, email, genero, turno, fecha_nacimiento, curso, paralelo, institucion:instituciones(nombre), evaluaciones_instrumento!id_paciente(tipo_instrumento, fecha_registro, alerta_activada, resultado_json, registrado_por_docente_id)'
      )
      .in('rol', ['paciente', 'persona_particular'])
      .order('nombre', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(({ evaluaciones_instrumento, ...paciente }) => {
      const evaluaciones = evaluaciones_instrumento ?? [];
      const tieneRegistroDocente = evaluaciones.some((e) => e.registrado_por_docente_id != null);

      return {
        ...paciente,
        evaluaciones,
        tieneAlertaActiva: evaluaciones.some((e) => e.alerta_activada),
        tipoPersona:
          paciente.rol === 'persona_particular'
            ? null
            : evaluaciones.length === 0
              ? null
              : tieneRegistroDocente
                ? 'docente'
                : 'estudiante',
      };
    });
  },

  /**
   * Trae TODOS los campos capturados al registrarse (institucional o
   * particular), para el Informe Consolidado de un paciente puntual —
   * `obtenerPacientesPropios()` (el listado general) no necesita este
   * detalle completo para cada fila de la tabla.
   */
  async obtenerPacientePropio(idPaciente) {
    const { data, error } = await supabase
      .from('usuarios')
      .select(
        'id, nombre, email, telefono, genero, curso, paralelo, turno, codigo_estudiante, fecha_nacimiento, institucion:instituciones(nombre)'
      )
      .eq('id', idPaciente)
      .eq('rol', 'paciente')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * NUEVO — equivalente a `obtenerPacientePropio`, pero para Persona
   * Particular: trae su propio conjunto de campos (sin curso/paralelo/
   * turno/código de estudiante, que no le corresponden) para la historia
   * "Vista de informe individual de Persona Particular". Depende de la
   * misma RLS "usuarios_select" — si el psicólogo fuerza el acceso a
   * alguien fuera de su institución, esto devuelve `null`.
   */
  async obtenerPersonaParticularPropia(idPersona) {
    const { data, error } = await supabase
      .from('usuarios')
      .select(
        'id, nombre, telefono, carnet_identidad, edad, sexo, estado_civil, grado_instruccion, numero_hijos, tipo_trabajo, institucion:instituciones(nombre)'
      )
      .eq('id', idPersona)
      .eq('rol', 'persona_particular')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * NUEVO — para la historia "Vista de informe individual de Persona
   * Particular": trae la evaluación más reciente de una persona
   * puntual, de cualquier instrumento (no un instrumento fijo, ya que
   * Persona Particular tiene 5 distintos). Se consulta la tabla
   * directamente en vez de importar evaluacionesInstrumentoService del
   * módulo `evaluaciones` — un módulo no puede importar servicios de
   * otro módulo, solo hablarle a las mismas tablas de Supabase (mismo
   * criterio que ya usa `obtenerPacientesPropios` embebiendo
   * `evaluaciones_instrumento` en vez de llamar a ese servicio).
   */
  async obtenerUltimaEvaluacion(idPersona) {
    const { data, error } = await supabase
      .from('evaluaciones_instrumento')
      .select('tipo_instrumento, fecha_registro, resultado_json, alerta_activada')
      .eq('id_paciente', idPersona)
      .order('fecha_registro', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * NUEVO — para la historia "Filtrado de formularios según el tipo de
   * psicólogo/a": determina si el/la psicólogo/a autenticado/a atiende
   * en un Centro de Salud o en un colegio (Unidad Educativa/Institución),
   * a partir de `psicologo_institucion` -> `instituciones.tipo_institucion`.
   * Un psicólogo solo puede estar vinculado a UNA institución (SCRUM-49),
   * así que siempre hay a lo sumo 1 fila. Devuelve `null` si la persona
   * autenticada no tiene ninguna institución asignada (ej. superadmin,
   * que de todas formas nunca llega a llamar esto porque usa su propia
   * pantalla) — Dashboard.jsx trata `null` como "mostrar todo", igual
   * que "colegio", nunca como "ocultar todo" por accidente.
   */
  async obtenerTipoInstitucionPropia() {
    const { data, error } = await supabase
      .from('psicologo_institucion')
      .select('institucion:instituciones(tipo_institucion)')
      .maybeSingle();

    if (error) throw error;
    return data?.institucion?.tipo_institucion ?? null;
  },
};