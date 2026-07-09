// src/modules/evaluaciones/data/preguntasEncuesta.js
//
// Instrumento clínico: PHQ-9 (Patient Health Questionnaire-9).
// Cuestionario validado de tamizaje para el nivel de depresión, de uso
// libre en contextos clínicos y educativos.
//
// Este archivo es la única fuente de verdad del cuestionario. Si el
// psicólogo necesita cambiar el instrumento (otras preguntas, otra
// escala u otro puntaje máximo), solo se edita este archivo: ni la
// UI (PreguntaEncuesta) ni el hook (useEncuestaClinica) dependen del
// contenido específico de las preguntas.

// Escala de respuesta tipo Likert (0 a 3) aplicada a cada pregunta.
export const ESCALA_RESPUESTA = [
  { valor: 0, texto: 'Nunca' },
  { valor: 1, texto: 'Varios días' },
  { valor: 2, texto: 'Más de la mitad de los días' },
  { valor: 3, texto: 'Casi todos los días' },
];

// Las 9 preguntas son obligatorias; no existen respuestas opcionales
// en este instrumento.
export const PREGUNTAS_ENCUESTA = [
  { id: 'p1', texto: 'Poco interés o placer en hacer las cosas.' },
  { id: 'p2', texto: 'Se ha sentido decaído(a), deprimido(a) o sin esperanza.' },
  { id: 'p3', texto: 'Dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado.' },
  { id: 'p4', texto: 'Se ha sentido cansado(a) o con poca energía.' },
  { id: 'p5', texto: 'Falta de apetito o ha comido en exceso.' },
  {
    id: 'p6',
    texto:
      'Se ha sentido mal con usted mismo(a), o que es un fracaso, o que ha quedado mal consigo mismo(a) o con su familia.',
  },
  {
    id: 'p7',
    texto: 'Dificultad para concentrarse en cosas tales como leer el periódico o ver televisión.',
  },
  {
    id: 'p8',
    texto:
      'Se ha movido o hablado tan lento que otras personas lo han notado. O, por el contrario, ha estado tan inquieto(a) que se ha movido mucho más de lo normal.',
  },
  { id: 'p9', texto: 'Pensamientos de que estaría mejor muerto(a) o de hacerse daño de alguna manera.' },
];

// NOTA para la historia "Cálculo de diagnóstico" (siguiente entrega):
// el puntaje_total es la suma de los `valor` de las 9 respuestas
// (máximo 27 puntos). Rangos de referencia del PHQ-9:
//   0-4: Mínima · 5-9: Leve · 10-14: Moderada · 15-19: Mod-grave · 20-27: Grave
// Esa historia decide cómo esos 5 niveles se mapean a los 3 valores
// que acepta la columna `diagnostico` (Leve / Moderado / Severo).