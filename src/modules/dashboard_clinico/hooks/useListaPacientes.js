// Carga el listado de pacientes del psicólogo autenticado, una sola vez
// al montar. Dashboard.jsx aplica búsqueda/filtro/exportación sobre el
// array que devuelve este hook — el hook en sí no sabe nada de filtros,
// solo trae los datos.
import { useEffect, useState } from 'react';
import { pacientesService } from '../services/pacientesService';

export function useListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setLoading(true);
        setError(null);
        const data = await pacientesService.obtenerPacientesPropios();
        if (activo) setPacientes(data);
      } catch (err) {
        console.error('Error al cargar la lista de pacientes:', err.message);
        if (activo) setError('No se pudo cargar la lista de pacientes.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  return { pacientes, loading, error };
}
