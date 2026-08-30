// Alta, edición y baja REAL de cuentas de psicólogo. Nunca se hace
// directo con el cliente anónimo de Supabase: crear/editar/eliminar un
// usuario de Auth requiere la service_role key, que solo existe del lado
// servidor. Por eso cada método de escritura acá invoca una Edge Function
// (supabase/functions/crear-psicologo, editar-psicologo,
// eliminar-psicologo) en vez de hablarle directo a la tabla `usuarios`.
//
// Lectura: la única lectura pública/anónima que existió (listarPublico,
// sobre la vista `psicologos_publico`) era exclusiva del selector de
// "psicólogo designado" del registro de Consultantes, retirado del
// sistema en SCRUM-48. La vista quedó pendiente de eliminación en
// Supabase (ver SQL entregado aparte). `listarTodos()` de acá abajo es
// una lectura distinta y nueva: no es pública ni anónima, depende
// enteramente de la política RLS "usuarios_select" de la tabla
// `usuarios` (que ya incluye `is_superadmin()`), así que solo devuelve
// filas para quien inicia sesión como superadministrador — cualquier
// otro rol recibe una lista vacía, sin necesidad de comprobarlo acá.
// Se usa para poblar el catálogo completo de psicólogos en el Panel
// Consolidado (dashboard_clinico), sin depender de qué psicólogos ya
// tienen resultados asignados.
import { supabase } from '../../../core/api/supabaseClient';

/**
 * Invoca una Edge Function y extrae el mensaje de error real del cuerpo
 * de la respuesta cuando el status no es 2xx. Sin esto, supabase-js
 * devuelve un mensaje genérico ("Edge Function returned a non-2xx status
 * code") en vez del mensaje específico que la función ya preparó.
 */
async function invocarFuncion(nombre, body) {
  const { data, error } = await supabase.functions.invoke(nombre, { body });

  if (error) {
    let mensaje = error.message;
    if (error.context && typeof error.context.json === 'function') {
      try {
        const cuerpo = await error.context.json();
        if (cuerpo?.error) mensaje = cuerpo.error;
      } catch {
        // El cuerpo no era JSON parseable; se conserva el mensaje genérico
      }
    }
    throw new Error(mensaje);
  }

  return data;
}

export const psicologosService = {
  async crear({ nombre, correo, passwordTemporal }) {
    return invocarFuncion('crear-psicologo', {
      nombre,
      email: correo,
      password: passwordTemporal,
    });
  },

  async editar(id, { nombre, correo }) {
    return invocarFuncion('editar-psicologo', { id, nombre, email: correo });
  },

  async eliminar(id) {
    return invocarFuncion('eliminar-psicologo', { id });
  },

  /**
   * Catálogo completo de psicólogos registrados en la plataforma, sin
   * importar si ya tienen resultados o instituciones asignadas. Pensado
   * para poblar selects de filtro (Panel Consolidado del
   * superadministrador) — no para pantallas de gestión, que ya usan
   * AsignacionPsicologos.jsx dentro del módulo `instituciones`.
   */
  async listarTodos() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email')
      .eq('rol', 'psicologo')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },
};