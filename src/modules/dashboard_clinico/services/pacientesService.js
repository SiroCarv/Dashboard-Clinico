import { supabase } from '../../../core/api/supabaseClient';

// Usa la política RLS ya existente "usuarios_select_psicologo_pacientes":
// solo devuelve pacientes de las instituciones asignadas al psicólogo
// autenticado (o ninguno, si el psicólogo fuerza el acceso a otro).
export const pacientesService = {
  async obtenerPacientesPropios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, curso, paralelo, institucion:instituciones(nombre)')
      .eq('rol', 'paciente')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async obtenerPacientePropio(idPaciente) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, curso, paralelo, institucion:instituciones(nombre)')
      .eq('id', idPaciente)
      .eq('rol', 'paciente')
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
