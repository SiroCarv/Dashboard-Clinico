// Acceso de solo lectura a `usuarios` desde el punto de vista del
// psicólogo: listar a sus pacientes y ver el detalle completo de uno.
// Ambos métodos dependen enteramente de las políticas RLS del lado del
// servidor para decidir qué filas son visibles — este archivo nunca
// filtra "manualmente" por institución en el cliente.
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
   * por cada evaluación enviada, `tipo_instrumento`, `fecha_registro` y
   * `resultado_json` (antes solo se traía `alerta_activada`).
   * `resultado_json` es el mismo objeto `{ puntaje_total, categoria }`
   * que ya usa InformeConsolidadoPaciente.jsx para Clima de Aula — acá
   * se usa para armar el gráfico de distribución por categoría (para
   * GSHS siempre viene null, no genera categoría — ver nota en
   * evaluaciones/data/gshsData.js). Se devuelven dos formas del mismo
   * dato para no romper a quien ya consumía esto:
   *  - `evaluaciones`: el arreglo completo, para que
   *    useResumenFormularios arme los gráficos y filtre por instrumento/
   *    fecha de envío.
   *  - `tieneAlertaActiva`: el mismo booleano reducido de siempre, para
   *    que TablaPacientes.jsx siga funcionando sin cambios.
   * El embed respeta la misma política RLS "instrumento_select" de esa
   * tabla, así que nunca expone datos de pacientes fuera de las
   * instituciones (o asignación directa) del psicólogo.
   */
  async obtenerPacientesPropios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select(
        'id, nombre, email, genero, turno, fecha_nacimiento, curso, paralelo, institucion:instituciones(nombre), evaluaciones_instrumento(tipo_instrumento, fecha_registro, alerta_activada, resultado_json)'
      )
      .eq('rol', 'paciente')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(({ evaluaciones_instrumento, ...paciente }) => ({
      ...paciente,
      evaluaciones: evaluaciones_instrumento ?? [],
      tieneAlertaActiva: (evaluaciones_instrumento ?? []).some((e) => e.alerta_activada),
    }));
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
};