// Recolecta las respuestas de UN instrumento (Clima de Aula o GSHS) en
// memoria local, sin escribir nada en la base todavía — a diferencia de
// useFormularioInstrumento.js (módulo evaluaciones), que envía apenas se
// completa la última página. Acá el envío real queda a cargo de
// RegistroCasoDocente.jsx, recién después de que el docente elige un
// psicólogo (criterio SCRUM-51: el psicólogo se elige ANTES de
// confirmar el envío).
//
// Duplica intencionalmente la lógica de "aplanar preguntas" y "qué
// cuenta como respondida" de evaluaciones/hooks/useFormularioInstrumento.js
// en vez de importarla: ese archivo no forma parte de la API pública del
// módulo evaluaciones (index.js), y la arquitectura del proyecto prohíbe
// importar rutas internas de otro módulo.
//
// Simplificación deliberada frente al formulario de autoenvío: acá NO
// hay paginación de 10 en 10 — todas las preguntas del instrumento se
// muestran en una sola pantalla con scroll. El uso de un docente es
// puntual (un caso ocasional, no decenas por sesión), así que se
// priorizó menos código sobre paridad exacta de UX. Si esto molesta en
// la práctica, es un cambio chico de agregar después.
import { useMemo, useState } from 'react';

function estaRespondida(valor) {
  return valor !== undefined && valor !== null && valor !== '';
}

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

export function useCuestionarioCaso(instrumento) {
  const preguntas = useMemo(() => aplanarPreguntas(instrumento.secciones), [instrumento]);

  const [respuestas, setRespuestas] = useState({});
  const [mostrarFaltantes, setMostrarFaltantes] = useState(false);

  const responder = (clave, valor) => {
    setRespuestas((prev) => ({ ...prev, [clave]: valor }));
  };

  const todoRespondido = preguntas.every((p) => estaRespondida(respuestas[p.clave]));

  // Se llama al intentar avanzar al paso de elegir psicólogo. Si falta
  // algo, activa las marcas de "Falta responder" en pantalla y devuelve
  // false para que el llamador no avance de paso.
  const intentarValidar = () => {
    if (!todoRespondido) {
      setMostrarFaltantes(true);
      return false;
    }
    setMostrarFaltantes(false);
    return true;
  };

  // Formato exacto { modulo, numero, valor } que espera
  // registrar_caso_docente (mismo que usa el autoenvío del estudiante).
  const respuestasJson = () =>
    preguntas.map((p) => ({
      modulo: p.seccionTitulo,
      numero: p.numero,
      valor: respuestas[p.clave],
    }));

  return {
    preguntas,
    respuestas,
    responder,
    todoRespondido,
    mostrarFaltantes,
    intentarValidar,
    respuestasJson,
  };
}