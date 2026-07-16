import { useState, useEffect, useCallback } from 'react';
import { evaluacionesService } from '../../evaluaciones';

/**
 * Carga el historial de evaluaciones visible para el psicólogo autenticado
 * y se mantiene actualizado en tiempo real (historia "Alertas de Riesgo
 * Severo", SCRUM-13).
 *
 * El filtrado por institución/paciente ya lo resuelve la política RLS
 * "historial_select_psicologo" del lado de la base de datos; este hook
 * solo se encarga del estado de carga/error en la UI.
 *
 * `version` es un truco intencional para poder exponer `recargar()`: en
 * vez de llamar a una función de carga memoizada desde fuera del efecto
 * (patrón que dispara la regla react-hooks/set-state-in-effect en
 * eslint-plugin-react-hooks@7), incrementamos un contador y dejamos que
 * el propio efecto sea la única fuente que llama a los setters de estado.
 *
 * Solo la PRIMERA carga (version === 0) activa el spinner de pantalla
 * completa. Las recargas posteriores —ya sea manuales vía `recargar()` o
 * disparadas por el evento de tiempo real— actualizan la tabla en
 * silencio, para que una nueva evaluación no haga "parpadear" el
 * dashboard mientras el psicólogo lo tiene abierto (criterio de
 * aceptación: la fila nueva debe resaltar en tiempo real, sin recargar
 * la página manualmente).
 */
export function useHistorialEvaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;
    const esPrimeraCarga = version === 0;

    async function cargar() {
      try {
        if (esPrimeraCarga) setLoading(true);
        setError(null);
        const data = await evaluacionesService.obtenerHistorial();
        if (activo) setEvaluaciones(data);
      } catch (err) {
        console.error('Error al cargar historial de evaluaciones:', err.message);
        if (activo) setError('No se pudo cargar el historial de evaluaciones.');
      } finally {
        if (activo && esPrimeraCarga) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  // Suscripción en tiempo real: cuando entra una nueva evaluación (INSERT)
  // visible para este psicólogo, se vuelve a pedir el historial completo
  // (con sus joins de paciente/institución) en vez de intentar mezclar a
  // mano la fila cruda del evento con el estado local.
  useEffect(() => {
    const cancelarSuscripcion = evaluacionesService.suscribirseANuevasEvaluaciones(() => {
      recargar();
    });

    return () => {
      cancelarSuscripcion();
    };
  }, [recargar]);

  return { evaluaciones, loading, error, recargar };
}