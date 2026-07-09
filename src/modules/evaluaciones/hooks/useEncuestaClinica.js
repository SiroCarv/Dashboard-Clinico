import { useState, useEffect } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import { evaluacionesService } from '../services/evaluacionesService';
import { PREGUNTAS_ENCUESTA } from '../data/preguntasEncuesta';

export const PASOS_ENCUESTA = {
  CONSENTIMIENTO: 'consentimiento',
  FORMULARIO: 'formulario',
  ENVIADA: 'enviada',
};

export function useEncuestaClinica() {
  const [paso, setPaso] = useState(PASOS_ENCUESTA.CONSENTIMIENTO);
  const [aceptaConsentimiento, setAceptaConsentimiento] = useState(false);

  const [respuestas, setRespuestas] = useState({});
  const [idPaciente, setIdPaciente] = useState(null);

  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // La ruta /encuesta ya está protegida por RutaProtegida (rol "paciente"),
  // así que aquí solo necesitamos leer el id de la sesión ya validada
  // para poder vincular la evaluación a su dueño.
  useEffect(() => {
    const cargarPaciente = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIdPaciente(session.user.id);
      }
    };

    cargarPaciente();
  }, []);

  const comenzarEvaluacion = () => {
    if (!aceptaConsentimiento) return;
    setPaso(PASOS_ENCUESTA.FORMULARIO);
  };

  const seleccionarRespuesta = (idPregunta, valor) => {
    setRespuestas((prev) => ({ ...prev, [idPregunta]: valor }));
  };

  const enviarEncuesta = async (e) => {
    e.preventDefault();
    setError('');

    // Los radios ya son "required" en el HTML (el navegador bloquea el
    // envío si falta alguno), pero validamos también en JS por si el
    // estado llega a quedar desincronizado.
    const faltantes = PREGUNTAS_ENCUESTA.filter((p) => respuestas[p.id] === undefined);
    if (faltantes.length > 0) {
      setError('Por favor responde todas las preguntas antes de continuar.');
      return;
    }

    if (!idPaciente) {
      setError('No se pudo identificar tu sesión. Vuelve a iniciar sesión e inténtalo de nuevo.');
      return;
    }

    setEnviando(true);

    // Captura de la información en formato JSON, tal como pide el
    // criterio de aceptación de la historia.
    const respuestasJson = PREGUNTAS_ENCUESTA.map((pregunta) => ({
      id_pregunta: pregunta.id,
      texto_pregunta: pregunta.texto,
      valor: respuestas[pregunta.id],
    }));

    try {
      await evaluacionesService.enviarEvaluacion({ idPaciente, respuestasJson });
      setPaso(PASOS_ENCUESTA.ENVIADA);
    } catch (err) {
      console.error('Error al enviar la evaluación:', err.message);
      setError('Ocurrió un error al enviar tu evaluación. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return {
    paso,
    aceptaConsentimiento,
    setAceptaConsentimiento,
    comenzarEvaluacion,
    respuestas,
    seleccionarRespuesta,
    enviarEncuesta,
    error,
    enviando,
  };
}