// Carga el listado consolidado de resultados de evaluaciones (todas las
// instituciones y psicólogos) una sola vez al montar. La página aplica
// los filtros de institución/psicólogo/fecha sobre el array que
// devuelve este hook — el hook en sí no sabe nada de filtros, solo trae
// los datos (mismo patrón que useListaPacientes.js).
import { useEffect, useState } from 'react';
import { resultadosGlobalesService } from '../services/resultadosGlobalesService';

export function useResultadosGlobales() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setError(null);
        const data = await resultadosGlobalesService.obtenerResultadosGlobales();
        if (activo) setResultados(data);
      } catch (err) {
        console.error('Error al cargar el panel consolidado:', err.message);
        if (activo) setError('No se pudo cargar el panel consolidado de resultados.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  return { resultados, loading, error };
}