// Capa de servicio para operaciones de Auth que no son un simple login o
// registro de formulario (esos siguen llamando a `supabase.auth` directo
// desde su propia página — ver nota en useCerrarSesion.js).
import { supabase } from '../../../core/api/supabaseClient';

export const authService = {
  async cerrarSesion() {
    // Libera la sesión única primero (mientras el JWT todavía es válido:
    // la función necesita `auth.uid()` para saber a quién liberar), y
    // recién después cierra la sesión de Supabase en sí. Si se hiciera al
    // revés, `auth.uid()` ya sería NULL dentro de la función y no podría
    // saber qué fila de `usuarios` liberar.
    try {
      await supabase.rpc('cerrar_sesion_unica');
    } catch (err) {
      console.error('No se pudo liberar la sesión única:', err.message);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
