// Lecturas propias del Panel de Supervisión del Jefe/a de Centro de Salud:
// a qué centro pertenece la persona que inició sesión y quiénes son los
// psicólogos/as de ese centro. La lista de personas y sus evaluaciones NO
// sale de acá: el panel reutiliza pacientesService.obtenerPacientesPropios,
// que ya trae lo mismo para el psicólogo.
//
// Igual que pacientesService, este archivo nunca filtra "a mano" por
// centro: las políticas RLS del jefe/a (basadas en usuarios.institucion_id
// de su propia fila) deciden qué filas son visibles. Por eso el equipo se
// pide con un simple `rol = 'psicologo'`: para un/a jefe/a la base solo
// devuelve a los psicólogos de su propio centro.
//
// El centro se lee de `usuarios.institucion_id` y no de
// `psicologo_institucion` (que es lo que usa el psicólogo): el jefe/a no
// tiene fila en esa tabla, su vínculo es solo ese campo de su cuenta.
import { supabase } from '../../../core/api/supabaseClient';

export const supervisionCentroService = {
  /**
   * Centro de salud de la persona autenticada: { id, nombre, tipoInstitucion },
   * o `null` si su cuenta no tiene centro (por ejemplo, porque el centro
   * fue eliminado — la base deja `institucion_id` en NULL en ese caso).
   * La pantalla trata `null` como "sin centro asignado", no como error.
   */
  async obtenerCentroPropio() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const idPropio = session?.user?.id;
    if (!idPropio) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select('institucion:instituciones(id, nombre, tipo_institucion)')
      .eq('id', idPropio)
      .maybeSingle();

    if (error) throw error;
    if (!data?.institucion) return null;

    return {
      id: data.institucion.id,
      nombre: data.institucion.nombre,
      tipoInstitucion: data.institucion.tipo_institucion ?? null,
    };
  },

  /**
   * Psicólogos/as del centro, por orden alfabético. Solo datos de equipo
   * (nombre, correo, turno/cargo): a pedido de la cliente el panel no
   * muestra métricas por psicólogo.
   */
  async obtenerEquipo() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, turno_psicologo')
      .eq('rol', 'psicologo')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },
};
