// Carga, una sola vez al montar, el centro del/la jefe/a autenticado/a y
// el equipo de psicólogos/as de ese centro (ver
// supervisionCentroService). Separado de useListaPacientes a propósito:
// son preguntas distintas (quién forma parte de mi equipo / quiénes son
// las personas que se atienden), y la segunda se actualiza en tiempo
// real mientras que el equipo casi nunca cambia durante una sesión.
//
// `centro` queda en `null` tanto mientras carga como si la cuenta no
// tiene centro; la pantalla distingue ambos casos mirando `loading`
// antes de decir "sin centro asignado".
import { useEffect, useState } from 'react';
import { supervisionCentroService } from '../services/supervisionCentroService';

export function useSupervisionCentro() {
  const [centro, setCentro] = useState(null);
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const [centroPropio, equipoDelCentro] = await Promise.all([
          supervisionCentroService.obtenerCentroPropio(),
          supervisionCentroService.obtenerEquipo(),
        ]);
        if (!activo) return;
        setCentro(centroPropio);
        setEquipo(equipoDelCentro);
      } catch (err) {
        console.error('Error al cargar el panel de supervisión:', err.message);
        if (activo) setError('No se pudo cargar la información de tu centro.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return { centro, equipo, loading, error };
}
