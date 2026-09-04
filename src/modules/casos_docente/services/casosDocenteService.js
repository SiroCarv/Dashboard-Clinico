// Acceso a datos para el flujo de "Reportes de Docente".
//
// Reemplaza al flujo de SCRUM-51 (seleccionar un alumno ya registrado +
// completar dos instrumentos clínicos completos a su nombre) por un
// reporte de texto libre: el docente escribe nombre/apellido del alumno
// a mano (no hace falta que tenga cuenta en el sistema) y describe el
// caso. SCRUM-51 y su tabla (evaluaciones_instrumento) quedan intactas,
// sin tocar -- es historia cerrada; esta es una tabla nueva y separada
// (reportes_docente).
//
// La escritura es un INSERT directo (no una función RPC, a diferencia
// del flujo anterior): la única regla de negocio es "el docente solo
// puede crear reportes a su propio nombre", que ya cubre la policy
// reportes_docente_insert_propio (auth.uid() = docente_id). La
// institución se resuelve sola del lado del servidor con un trigger (ver
// migración "reportes_docente_simple"), así que el cliente nunca la
// manda ni puede mentir sobre ella.
import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'reportes_docente';

export const casosDocenteService = {
  /** Reportes que el docente autenticado ya envió, más recientes primero. */
  async obtenerMisReportes(docenteId) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('id, nombre_alumno, apellido_alumno, curso, paralelo, turno, descripcion, fecha_registro')
      .eq('docente_id', docenteId)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Reportes de todos los docentes de la institución del psicólogo
   * autenticado. El alcance ya lo resuelve la policy de SELECT (RLS) --
   * acá no hace falta (ni conviene) filtrar institución a mano.
   */
  async obtenerReportesInstitucion() {
    const { data, error } = await supabase
      .from(TABLA)
      .select(
        'id, nombre_alumno, apellido_alumno, curso, paralelo, turno, descripcion, fecha_registro, docente:usuarios!docente_id ( email )'
      )
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Registra un nuevo reporte a nombre del docente autenticado. */
  async registrarReporte({ docenteId, nombreAlumno, apellidoAlumno, curso, paralelo, turno, descripcion }) {
    const { error } = await supabase.from(TABLA).insert([
      {
        docente_id: docenteId,
        nombre_alumno: nombreAlumno,
        apellido_alumno: apellidoAlumno,
        curso,
        paralelo,
        turno,
        descripcion,
      },
    ]);

    if (error) throw error;
  },
};