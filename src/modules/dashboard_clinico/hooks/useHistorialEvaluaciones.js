import { useState, useEffect } from 'react';
import { evaluacionesService } from '../../evaluaciones';

/**
 * Carga el historial de evaluaciones visible para el psicólogo autenticado.
 * El filtrado por institución/paciente ya lo resuelve la política RLS
 * "historial_select_psicologo" del lado de la base de datos; este hook
 * solo se encarga del estado de carga/error en la UI.
 *
 * `version` es un truco intencional para poder exponer `recargar()`: en
 * vez de llamar a una función de carga memoizada desde fuera del efecto
 * (patrón que dispara la regla react-hooks/set-state-in-effect en
 * eslint-plugin-react-hooks@7), incrementamos un contador y dejamos que
 * el propio efecto sea la única fuente que llama a los setters de estado.
 */
export function useHistorialEvaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setLoading(true);
        setError(null);
        const data = await evaluacionesService.obtenerHistorial();
        if (activo) setEvaluaciones(data);
      } catch (err) {
        console.error('Error al cargar historial de evaluaciones:', err.message);
        if (activo) setError('No se pudo cargar el historial de evaluaciones.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [version]);

  const recargar = () => setVersion((v) => v + 1);

  return { evaluaciones, loading, error, recargar };
}