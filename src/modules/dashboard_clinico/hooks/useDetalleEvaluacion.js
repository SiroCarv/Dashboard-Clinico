import { useState, useEffect } from 'react';
import { evaluacionesService } from '../../evaluaciones';

/**
 * Carga el detalle completo de una evaluación puntual (historia
 * "Visualización de Detalle Clínico", SCRUM-21).
 *
 * Distingue dos estados de "no hay datos" a propósito:
 * - `noEncontrada`: la consulta respondió sin filas. Pasa tanto si el
 *   `idEvaluacion` no existe como si existe pero pertenece a un paciente
 *   fuera de las instituciones asignadas al psicólogo (la política RLS
 *   "historial_select_psicologo" bloquea la fila en ambos casos por
 *   igual). No se distingue cuál de los dos es, a propósito: revelar
 *   "existe pero no tienes acceso" filtraría información clínica de un
 *   paciente que no es tuyo.
 * - `error`: fallo real de red/servidor.
 */
export function useDetalleEvaluacion(idEvaluacion) {
  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (!idEvaluacion) {
        setLoading(false);
        setNoEncontrada(true);
        return;
      }

      setLoading(true);
      setError(null);
      setNoEncontrada(false);

      try {
        const data = await evaluacionesService.obtenerDetalleEvaluacion(idEvaluacion);
        if (!activo) return;

        if (data) {
          setEvaluacion(data);
        } else {
          setNoEncontrada(true);
        }
      } catch (err) {
        console.error('Error al cargar el detalle de la evaluación:', err.message);
        if (activo) setError('No se pudo cargar el detalle de esta evaluación.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [idEvaluacion]);

  return { evaluacion, loading, error, noEncontrada };
}