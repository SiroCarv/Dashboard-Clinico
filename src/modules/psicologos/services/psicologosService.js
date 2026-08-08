// Alta, edición y baja REAL de cuentas de psicólogo. Nunca se hace
// directo con el cliente anónimo de Supabase: crear/editar/eliminar un
// usuario de Auth requiere la service_role key, que solo existe del lado
// servidor. Por eso cada método de escritura acá invoca una Edge Function
// (supabase/functions/crear-psicologo, editar-psicologo,
// eliminar-psicologo) en vez de hablarle directo a la tabla `usuarios`.
//
// listarPublico() es la excepción: es una lectura, no una escritura, así
// que no necesita service_role ni Edge Function — consulta directo la
// vista `psicologos_publico` (id + nombre únicamente, de lectura pública
// a propósito) que usa el selector de "psicólogo designado" en el
// registro de Consultantes (RegistroParticular.jsx), antes de que esa
// persona tenga sesión.
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
   * Lista pública (id + nombre) de todas las cuentas de psicólogo, para
   * el selector de "psicólogo designado" del registro de Consultantes.
   * Lee de la vista `psicologos_publico`, no de `usuarios` directo — esa
   * vista es la única superficie de lectura anónima permitida sobre
   * cuentas de psicólogo (ver migración 011).
   */
  async listarPublico() {
    const { data, error } = await supabase
      .from('psicologos_publico')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },
};