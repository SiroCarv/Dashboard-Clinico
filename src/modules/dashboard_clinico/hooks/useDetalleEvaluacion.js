import { useState, useEffect } from 'react';
import { evaluacionesService } from '../../evaluaciones';

/**
 * Carga el detalle completo de una evaluación puntual (historia
 * "Visualización de Detalle Clínico", SCRUM-21).
 *
 * Distingue dos estados de "no hay datos" a propósito:
 * - `noEncontrada`: la consulta respondió sin filas, el id no es un UUID
 *   válido, o el paciente pertenece a una institución fuera del alcance
 *   del psicólogo (la política RLS "historial_select_psicologo" bloquea
 *   la fila en todos esos casos por igual). No se distingue cuál de los
 *   tres es, a propósito: revelar el motivo exacto filtraría información
 *   sobre la existencia de una evaluación que no es tuya.
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
        // 22P02 = invalid_text_representation: pasa cuando el segmento de
        // la URL no es ni siquiera un UUID válido (ej. alguien edita la
        // ruta a mano). Se trata igual que "no encontrada" — no como un
        // error técnico — para no revelar ninguna distinción entre "id
        // inválido", "no existe" o "existe pero no tienes acceso".
        if (err.code === '22P02') {
          if (activo) setNoEncontrada(true);
        } else {
          console.error('Error al cargar el detalle de la evaluación:', err.message);
          if (activo) setError('No se pudo cargar el detalle de esta evaluación.');
        }
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