// Acceso a datos de consentimiento/asentimiento y fecha de nacimiento del
// paciente autenticado. Usado por useConsentimiento.js.
//
// Requiere la migración "006_consentimiento_y_envio_individual.sql":
// - usuarios.fecha_nacimiento + función RPC registrar_fecha_nacimiento()
// - tabla consentimientos con sus políticas RLS
import { supabase } from '../../../core/api/supabaseClient';

const TABLA = 'consentimientos';

export const consentimientoService = {
  /**
   * Lee la fecha de nacimiento ya registrada del paciente autenticado (o
   * null si todavía no la cargó). useConsentimiento.js la usa para
   * calcular la edad y decidir qué rama de consentimiento le corresponde
   * (menor con tutor+asentimiento, o mayor con autoconsentimiento).
   */
  async obtenerFechaNacimientoPropia(idPaciente) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('fecha_nacimiento')
      .eq('id', idPaciente)
      .single();

    if (error) throw error;
    return data?.fecha_nacimiento ?? null;
  },

  /**
   * Registra la fecha de nacimiento UNA sola vez, vía función RPC
   * (SECURITY DEFINER, auditada en la migración). No existe una política
   * de UPDATE abierta sobre `usuarios` a propósito: un paciente no debe
   * poder reescribir su propio rol o institución modificando su fila
   * directamente — la RPC solo permite tocar esa única columna, y solo
   * si todavía está vacía.
   */
  async registrarFechaNacimiento(fechaNacimiento) {
    const { error } = await supabase.rpc('registrar_fecha_nacimiento', {
      p_fecha: fechaNacimiento,
    });
    if (error) throw error;
  },

  /**
   * Trae TODO el historial de decisiones (aceptado/rechazado) por tipo de
   * documento para el paciente autenticado, no solo la más reciente:
   * si alguna vez se rechaza y luego se vuelve a intentar, se necesita
   * poder mostrar cuál fue la última decisión sin perder el rastro de
   * auditoría de las anteriores.
   */
  async obtenerConsentimientosPropios(idPaciente) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('tipo, aceptado, version_documento, fecha_registro')
      .eq('id_paciente', idPaciente)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Registra la decisión (aceptar o no) de un documento puntual
   * (tutor_menor / asentimiento_menor / propio_mayor). Nunca se actualiza
   * un registro existente: cada decisión queda como una fila nueva,
   * igual que el resto del historial clínico inmutable del proyecto.
   */
  async registrarDecision({ idPaciente, tipo, aceptado, versionDocumento }) {
    const { error } = await supabase.from(TABLA).insert([
      {
        id_paciente: idPaciente,
        tipo,
        aceptado,
        version_documento: versionDocumento,
      },
    ]);
    if (error) throw error;
  },
};
