import { supabase } from '../../../core/api/supabaseClient';

export const authService = {
  async cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};