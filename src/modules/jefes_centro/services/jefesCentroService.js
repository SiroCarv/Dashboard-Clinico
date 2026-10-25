// Alta, edición, baja y listado de cuentas de Jefe/a de Centro de Salud
// (rol 'jefe_centro'). Igual que psicologosService, las escrituras NO se
// hacen con el cliente anónimo: crear/editar/eliminar un usuario de Auth
// requiere la service_role key, que solo existe del lado servidor — por
// eso cada una invoca su Edge Function (crear-jefe-centro,
// editar-jefe-centro, eliminar-jefe-centro).
//
// Lectura: `listar()` no filtra por rol de quien llama; depende de la
// política RLS "usuarios_select" (que incluye `is_superadmin()`), así
// que solo devuelve filas para el superadministrador — cualquier otro
// rol recibe una lista vacía.
import { supabase } from '../../../core/api/supabaseClient';
import { invocarFuncionEdge } from '../../../shared/utils/invocarFuncionEdge';

export const jefesCentroService = {
  async listar() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, institucion_id, created_at')
      .eq('rol', 'jefe_centro')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async crear({ nombre, correo, passwordTemporal, institucionId }) {
    return invocarFuncionEdge('crear-jefe-centro', {
      nombre,
      email: correo,
      password: passwordTemporal,
      institucion_id: institucionId,
    });
  },

  async editar(id, { nombre, correo, institucionId }) {
    return invocarFuncionEdge('editar-jefe-centro', {
      id,
      nombre,
      email: correo,
      institucion_id: institucionId,
    });
  },

  async eliminar(id) {
    return invocarFuncionEdge('eliminar-jefe-centro', { id });
  },
};
