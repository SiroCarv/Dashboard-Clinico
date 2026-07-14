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
};