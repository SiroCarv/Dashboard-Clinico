// Capa de servicio para operaciones de Auth que no son un simple login o
// registro de formulario (esos siguen llamando a `supabase.auth` directo
// desde su propia página — ver nota en useCerrarSesion.js).
import { supabase } from '../../../core/api/supabaseClient';

export const authService = {
  async cerrarSesion() {
    // Antes de liberar la sesión única, intentamos refrescar el token de
    // acceso. Motivo (bug real detectado en producción, 30-ago-2026): si la
    // pestaña estuvo mucho tiempo en segundo plano, el navegador frena el
    // refresco automático de Supabase y el token de acceso puede llegar
    // vencido al momento del clic en "Cerrar sesión". Con un token vencido,
    // la llamada a `cerrar_sesion_unica` se ejecuta como "anon" en vez de
    // "authenticated" y Postgres la rechaza ("permission denied"): el
    // candado de sesión única queda trabado hasta que pasan las 12 horas
    // de la ventana de abandono, aunque la app ya haya "cerrado sesión"
    // localmente. `refreshSession()` usa el refresh token (que dura mucho
    // más que el de acceso) para renovarlo antes de intentar liberar.
    try {
      await supabase.auth.refreshSession();
    } catch (err) {
      console.error('No se pudo refrescar el token antes de cerrar sesión:', err.message);
    }

    // Libera la sesión única (mientras el JWT ya está fresco: la función
    // necesita `auth.uid()` para saber a quién liberar). Si esto sigue
    // fallando incluso después del refresh de arriba (ej. el refresh token
    // también está vencido, sesión realmente abandonada), no hay forma de
    // identificarse ante Postgres para liberarla desde acá — quedará para
    // la ventana de 12 horas o para "Forzar ingreso" desde Login la
    // próxima vez que alguien intente entrar con esta cuenta.
    try {
      const { error: errorRpc } = await supabase.rpc('cerrar_sesion_unica');
      if (errorRpc) throw errorRpc;
    } catch (err) {
      console.error('No se pudo liberar la sesión única:', err.message);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};