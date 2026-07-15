import { useState, useEffect } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import { evaluacionesService } from '../services/evaluacionesService';
import { PREGUNTAS_ENCUESTA } from '../data/preguntasEncuesta';

export const PASOS_ENCUESTA = {
  VERIFICANDO: 'verificando',
  YA_RESPONDIO: 'ya_respondio',
  CONSENTIMIENTO: 'consentimiento',
  FORMULARIO: 'formulario',
  ENVIADA: 'enviada',
};

export function useEncuestaClinica() {
  const [paso, setPaso] = useState(PASOS_ENCUESTA.VERIFICANDO);
  const [aceptaConsentimiento, setAceptaConsentimiento] = useState(false);

  const [respuestas, setRespuestas] = useState({});
  const [idPaciente, setIdPaciente] = useState(null);
  const [fechaEvaluacionPrevia, setFechaEvaluacionPrevia] = useState(null);

  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // La ruta /encuesta ya está protegida por RutaProtegida (rol "paciente"),
  // así que aquí solo necesitamos leer el id de la sesión ya validada. Antes
  // de mostrar el consentimiento, verificamos si este paciente YA tiene una
  // evaluación registrada: la encuesta es de una sola vez por diseño de
  // negocio, no solo una restricción de UI.
  useEffect(() => {
    let activo = true;

    async function inicializar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (activo) setPaso(PASOS_ENCUESTA.CONSENTIMIENTO);
        return;
      }

      if (activo) setIdPaciente(session.user.id);

      try {
        const previa = await evaluacionesService.obtenerEvaluacionPropia(session.user.id);
        if (!activo) return;

        if (previa) {
          setFechaEvaluacionPrevia(previa.fecha_registro);
          setPaso(PASOS_ENCUESTA.YA_RESPONDIO);
        } else {
          setPaso(PASOS_ENCUESTA.CONSENTIMIENTO);
        }
      } catch (err) {
        console.error('Error al verificar evaluación previa:', err.message);
        // Ante un error de verificación (ej. de red) dejamos pasar al
        // consentimiento en vez de bloquear al paciente sin explicación;
        // el UNIQUE de la base es la última línea de defensa si en
        // realidad ya había respondido.
        if (activo) setPaso(PASOS_ENCUESTA.CONSENTIMIENTO);
      }
    }

    inicializar();

    return () => {
      activo = false;
    };
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

      // 23505 = unique_violation. Puede pasar por una carrera (doble
      // pestaña, doble clic justo antes de que el botón se deshabilite):
      // la restricción UNIQUE de la base es quien realmente impide la
      // segunda fila, esta verificación del frontend es solo la primera
      // línea de defensa (mejor UX, no seguridad).
      if (err.code === '23505') {
        setPaso(PASOS_ENCUESTA.YA_RESPONDIO);
      } else {
        setError('Ocurrió un error al enviar tu evaluación. Intenta nuevamente.');
      }
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
    fechaEvaluacionPrevia,
  };
}