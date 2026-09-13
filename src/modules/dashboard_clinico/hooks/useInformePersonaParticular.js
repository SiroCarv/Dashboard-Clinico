// Trae los datos de UNA Persona Particular puntual (historia "Vista de
// informe individual de Persona Particular"), mismo patrón que
// useInformeConsolidado.js pero mucho más simple: acá no hace falta la
// lista completa de instrumentos respondidos, solo el más reciente (ver
// pacientesService.obtenerUltimaEvaluacion).
import { useEffect, useState } from 'react';
import { pacientesService } from '../services/pacientesService';

export function useInformePersonaParticular(idPersona) {
  const [persona, setPersona] = useState(null);
  const [ultimaEvaluacion, setUltimaEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setError(null);
        const [datosPersona, evaluacion] = await Promise.all([
          pacientesService.obtenerPersonaParticularPropia(idPersona),
          pacientesService.obtenerUltimaEvaluacion(idPersona),
        ]);

        if (activo) {
          setPersona(datosPersona);
          setUltimaEvaluacion(evaluacion);
        }
      } catch (err) {
        console.error('Error al cargar el informe de la persona:', err.message);
        if (activo) setError('No se pudo cargar el informe de esta persona.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [idPersona]);

  return { persona, ultimaEvaluacion, loading, error };
}