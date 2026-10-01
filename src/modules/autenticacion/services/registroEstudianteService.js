// Registro de estudiantes sin correo. Todo el trabajo (validar el código de
// institución, crear la cuenta, asignar el código de estudiante) lo hace la
// Edge Function `registrar-estudiante` en el servidor.
import { supabase } from '../../../core/api/supabaseClient';

// Devuelve { codigo_estudiante } o lanza un Error con mensaje para mostrar.
export async function registrarEstudiante({ nombre, codigoInstitucion, password, curso, paralelo, turno, genero }) {
  const { data, error } = await supabase.functions.invoke('registrar-estudiante', {
    body: { nombre, codigoInstitucion, password, curso, paralelo, turno, genero },
  });

  // Cuando la función responde con un error HTTP, el mensaje útil viene en el
  // cuerpo de la respuesta (error.context), no en error.message.
  if (error) {
    let mensaje = 'No se pudo completar el registro. Intenta nuevamente.';
    try {
      const cuerpo = await error.context?.json?.();
      if (cuerpo?.error) mensaje = cuerpo.error;
    } catch {
      // se queda el mensaje genérico
    }
    throw new Error(mensaje);
  }

  if (data?.error) throw new Error(data.error);
  if (!data?.data?.codigo_estudiante) {
    throw new Error('No se pudo completar el registro. Intenta nuevamente.');
  }
  return data.data;
}
