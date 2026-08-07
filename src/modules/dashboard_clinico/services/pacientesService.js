// Acceso de solo lectura a `usuarios` desde el punto de vista del
// psicólogo: listar a sus pacientes y ver el detalle completo de uno.
// Ambos métodos dependen enteramente de las políticas RLS del lado del
// servidor para decidir qué filas son visibles — este archivo nunca
// filtra "manualmente" por institución en el cliente.
import { supabase } from '../../../core/api/supabaseClient';

export const pacientesService = {
  /**
   * Listado para la tabla del Dashboard. Usa la política RLS
   * "usuarios_select_psicologo_pacientes": solo devuelve pacientes de las
   * instituciones asignadas al psicólogo autenticado (o ninguno, si el
   * psicólogo fuerza el acceso a otra). Importante: un Consultante
   * particular (institucion_id = NULL) nunca aparece acá — ver la nota de
   * RLS en shared/utils/identidadUsuario.js.
   *
   * También trae, embebido vía la relación con `evaluaciones_instrumento`,
   * si el paciente tiene alguna evaluación con `alerta_activada = true`
   * (ej. riesgo suicida en el módulo de Salud Mental del GSHS). Se reduce
   * acá mismo a un único booleano `tieneAlertaActiva` para que
   * TablaPacientes.jsx pueda resaltar la fila sin conocer la forma de la
   * tabla de evaluaciones. El embed respeta la misma política RLS
   * "instrumento_select_psicologo" de esa tabla, así que nunca expone
   * alertas de pacientes fuera de las instituciones del psicólogo.
   */
  async obtenerPacientesPropios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select(
        'id, nombre, email, curso, paralelo, institucion:instituciones(nombre), evaluaciones_instrumento(alerta_activada)'
      )
      .eq('rol', 'paciente')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(({ evaluaciones_instrumento, ...paciente }) => ({
      ...paciente,
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