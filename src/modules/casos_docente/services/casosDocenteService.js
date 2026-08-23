// Acceso a datos para "Registro de caso por Docente" (SCRUM-51).
//
// La lectura (listar alumnos/psicólogos) usa las políticas RLS nuevas
// "usuarios_select_docente_institucion" / "psicologo_institucion_select_docente"
// — nunca filtra institución "a mano" en el cliente, mismo criterio que
// pacientesService.js del módulo dashboard_clinico.
//
// La escritura pasa ENTERA por la función registrar_caso_docente
// (SECURITY DEFINER): esa tabla solo permite INSERT directo con
// auth.uid() = id_paciente (protege el autoenvío de estudiantes), y un
// docente nunca cumple esa condición al registrar en nombre de otro. La
// función hace sus propias validaciones del lado del servidor (misma
// institución, psicólogo válido) — el cliente nunca decide solo si el
// caso puede registrarse.
//
// Nota: el registro del docente NO exige consentimiento previo del
// alumno (confirmado con el cliente) — el consentimiento lo gestiona
// el psicólogo después, por separado, contactando al padre/tutor.
//
// Requiere la migración "0007_registro_caso_docente.sql" +
// "0008_docente_consentimiento_no_bloqueante.sql".
import { supabase } from '../../../core/api/supabaseClient';

const MENSAJES_ERROR = {
  ROL_INVALIDO: 'Tu cuenta no tiene permiso para registrar casos.',
  ALUMNO_FUERA_DE_INSTITUCION: 'Ese alumno no pertenece a tu institución.',
  PSICOLOGO_FUERA_DE_INSTITUCION: 'Ese psicólogo no pertenece a tu institución.',
  YA_EXISTE_CASO:
    'Ya existe un registro (propio o de otro docente) para este alumno. Si crees que es un error, contacta a Psicología.',
};

// Traduce el código crudo que devuelve la función SQL (ej. "P0001:
// ALUMNO_FUERA_DE_INSTITUCION") al mensaje que puede mostrarse tal cual en
// pantalla, sin exponer nombres de funciones ni códigos de Postgres.
function traducirError(error) {
  const codigo = Object.keys(MENSAJES_ERROR).find((clave) => error.message?.includes(clave));
  return new Error(codigo ? MENSAJES_ERROR[codigo] : 'No se pudo registrar el caso. Intenta nuevamente.');
}

export const casosDocenteService = {
  /** Alumnos (rol paciente) de la misma institución que el docente autenticado. */
  async obtenerAlumnosPropios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, curso, paralelo, turno')
      .eq('rol', 'paciente')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /** Psicólogos vinculados a la misma institución que el docente autenticado. */
  async obtenerPsicologosPropios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email')
      .eq('rol', 'psicologo')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Registra el caso completo (ambos instrumentos + psicólogo elegido)
   * como una sola operación atómica del lado del servidor.
   * `respuestasClima` / `respuestasGshs` deben venir ya armados como
   * arreglos [{ modulo, numero, valor }] — mismo formato exacto que usa
   * el autoenvío del estudiante, porque el trigger que calcula la alerta
   * de GSHS busca ahí, por nombre de módulo y número, las preguntas de
   * riesgo suicida.
   */
  async registrarCaso({ idAlumno, psicologoId, respuestasClima, respuestasGshs }) {
    const { error } = await supabase.rpc('registrar_caso_docente', {
      p_id_alumno: idAlumno,
      p_psicologo_id: psicologoId,
      p_respuestas_clima: respuestasClima,
      p_respuestas_gshs: respuestasGshs,
    });

    if (error) throw traducirError(error);
  },
};