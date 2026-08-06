import { useEffect, useMemo, useState } from 'react';
import { evaluacionesInstrumentoService } from '../services/evaluacionesInstrumentoService';

const PREGUNTAS_POR_PAGINA = 10;

// Una pregunta cuenta como "contestada" solo si tiene un valor real. Sin
// esto, los dos únicos campos de texto libre del formulario (estatura y
// peso, Módulo sobre Conductas Alimentarias de GSHS) podían quedar en
// blanco y pasar la validación: si el usuario escribía y borraba todo,
// `CampoTexto` dispara onCambiar(''), y '' !== undefined, así que
// quedaba marcada como respondida aunque estuviera vacía. Todas las
// preguntas de GSHS son obligatorias (decisión del cliente, documentada
// en gshsData.js) — este helper es la única fuente de verdad de qué
// cuenta como "contestada" en todo el formulario.
function estaRespondida(valor) {
  return valor !== undefined && valor !== null && valor !== '';
}

// Aplana las secciones del instrumento en una sola lista ordenada de
// preguntas, cada una con el título de su sección adjunto — necesario
// para paginar de 10 en 10 sin perder de qué tema es cada pregunta, y
// para armar la clave modulo+numero que espera el backend.
function aplanarPreguntas(secciones) {
  return secciones.flatMap((seccion) =>
    seccion.items.map((item) => ({
      ...item,
      seccionTitulo: seccion.titulo,
      seccionIntro: seccion.intro,
      clave: `${seccion.titulo}::${item.numero}`,
    }))
  );
}

export function useFormularioInstrumento({ idPaciente, tipoInstrumento, instrumento }) {
  const preguntas = useMemo(() => aplanarPreguntas(instrumento.secciones), [instrumento]);
  const totalPaginas = Math.ceil(preguntas.length / PREGUNTAS_POR_PAGINA);

  const [pagina, setPagina] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [envioPrevio, setEnvioPrevio] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  // Historia "Paginación de formularios": los indicadores de "falta
  // responder" NO se muestran apenas se abre una página — solo aparecen
  // después de un intento fallido de avanzar/enviar (mostrarFaltantes).
  // Al responder empieza a "achicarse" en vivo (ver `responder`), y al
  // cambiar de página exitosamente se vuelve a ocultar para la nueva.
  const [mostrarFaltantes, setMostrarFaltantes] = useState(false);
  const [mensajeValidacion, setMensajeValidacion] = useState('');

  useEffect(() => {
    let activo = true;

    async function verificarEnvioPrevio() {
      if (!idPaciente) return;
      try {
        setCargando(true);
        const data = await evaluacionesInstrumentoService.obtenerEnvioPropio(idPaciente, tipoInstrumento);
        if (activo) setEnvioPrevio(data);
      } catch (err) {
        console.error(`Error al verificar envío previo de ${tipoInstrumento}:`, err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    verificarEnvioPrevio();

    return () => {
      activo = false;
    };
  }, [idPaciente, tipoInstrumento]);

  const preguntasDePagina = preguntas.slice(
    pagina * PREGUNTAS_POR_PAGINA,
    pagina * PREGUNTAS_POR_PAGINA + PREGUNTAS_POR_PAGINA
  );

  const responder = (clave, valor) => {
    setRespuestas((prev) => ({ ...prev, [clave]: valor }));
  };

  const paginaCompleta = preguntasDePagina.every((p) => estaRespondida(respuestas[p.clave]));
  const todoRespondido = preguntas.every((p) => estaRespondida(respuestas[p.clave]));
  const esUltimaPagina = pagina === totalPaginas - 1;

  // Reemplaza al "Siguiente" directo: si falta alguna respuesta de la
  // página actual, NO avanza — en cambio, activa las marcas de "falta
  // responder" para que el paciente vea exactamente cuáles. Si ya están
  // todas, recién ahí pasa a la siguiente página.
  const intentarSiguiente = () => {
    if (!paginaCompleta) {
      setMostrarFaltantes(true);
      setMensajeValidacion('Respondé las preguntas marcadas antes de continuar.');
      return;
    }
    setMostrarFaltantes(false);
    setMensajeValidacion('');
    setPagina((p) => Math.min(p + 1, totalPaginas - 1));
  };

  const irAnterior = () => {
    setMostrarFaltantes(false);
    setMensajeValidacion('');
    setPagina((p) => Math.max(p - 1, 0));
  };

  // Reemplaza al envío directo: si falta alguna respuesta en CUALQUIER
  // página (no solo la actual), lleva al paciente a la primera pregunta
  // pendiente y la marca, en vez de solo dejar el botón deshabilitado sin
  // explicación.
  const intentarEnviar = async () => {
    if (!idPaciente) return;

    if (!todoRespondido) {
      const indicePrimeraFaltante = preguntas.findIndex((p) => !estaRespondida(respuestas[p.clave]));
      const paginaFaltante = Math.floor(indicePrimeraFaltante / PREGUNTAS_POR_PAGINA);
      setPagina(paginaFaltante);
      setMostrarFaltantes(true);
      setMensajeValidacion('Todavía faltan preguntas por responder — te llevamos a la primera pendiente.');
      return;
    }

    setError('');
    setEnviando(true);
    try {
      const respuestasJson = preguntas.map((p) => ({
        modulo: p.seccionTitulo,
        numero: p.numero,
        valor: respuestas[p.clave],
      }));
      await evaluacionesInstrumentoService.enviarInstrumento({
        idPaciente,
        tipoInstrumento,
        respuestas: respuestasJson,
      });
      setEnviado(true);
    } catch (err) {
      if (err.message === 'YA_ENVIADO') {
        setError('Ya habías enviado este formulario anteriormente.');
        setEnvioPrevio({ fecha_registro: null });
      } else {
        console.error(`Error al enviar ${tipoInstrumento}:`, err.message);
        setError('No se pudo enviar el formulario. Intenta nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return {
    cargando,
    yaEnviado: Boolean(envioPrevio) || enviado,
    fechaEnvioPrevio: envioPrevio?.fecha_registro ?? null,
    preguntasDePagina,
    pagina,
    totalPaginas,
    respuestas,
    responder,
    paginaCompleta,
    todoRespondido,
    esUltimaPagina,
    mostrarFaltantes,
    mensajeValidacion,
    intentarSiguiente,
    irAnterior,
    intentarEnviar,
    enviando,
    error,
  };
}