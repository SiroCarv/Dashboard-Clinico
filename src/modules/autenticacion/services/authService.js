import { supabase } from '../../../core/api/supabaseClient';

export const authService = {
  async cerrarSesion() {
    // Libera la sesión única primero (mientras el JWT todavía es válido:
    // la función necesita `auth.uid()` para saber a quién liberar), y
    // recién después cierra la sesión de Supabase en sí.
    try {
      await supabase.rpc('cerrar_sesion_unica');
    } catch (err) {
      console.error('No se pudo liberar la sesión única:', err.message);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};