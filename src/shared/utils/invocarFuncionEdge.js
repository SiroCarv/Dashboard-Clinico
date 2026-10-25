// Invoca una Edge Function de Supabase y devuelve su `data`. Cuando la
// función responde con un status que no es 2xx, extrae el mensaje real
// del cuerpo ({ error }) en vez de quedarse con el genérico de supabase-js
// ("Edge Function returned a non-2xx status code"), para que la pantalla
// pueda mostrarle a la persona el motivo concreto que la función preparó.
//
// Vive en `shared/` porque no pertenece a ningún dominio: cualquier
// módulo que hable con una Edge Function necesita exactamente esto.
// (`psicologosService` todavía tiene su propia copia privada de esta
// misma lógica; migrarlo a este archivo queda como limpieza pendiente.)
import { supabase } from '../../core/api/supabaseClient';

export async function invocarFuncionEdge(nombre, body) {
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
