// Instrumento: Cuidado Primario De Salud Familiar (APGAR Familiar).
//
// 5 preguntas sobre percepción del funcionamiento familiar, cada una con
// 3 opciones de frecuencia. INSTRUMENTO_APGAR_FAMILIAR (al final del
// archivo) es la forma que consume FormularioInstrumento.jsx — usa
// tipoRespuesta 'opciones', igual que Estrés/Ansiedad/Depresión, así que
// no hizo falta ningún componente de UI nuevo.
//
// El cálculo del resultado ocurre del lado de la base de datos (trigger
// `calcular_resultado_instrumento`), nunca acá ni en el cliente — mismo
// criterio que el resto de los instrumentos. La regla de puntuación:
//   Puntaje total posible: 0-10 (suma directa de las 5 respuestas, sin
//   preguntas de puntuación invertida).
//   Categorías: 0-3 Familia disfuncional · 4-6 Moderada disfunción
//   familiar · 7-10 Familia funcional.
//
// alerta_activada siempre queda en false para este instrumento (mismo
// criterio que Clima de Aula/Estrés/Ansiedad): no hay ningún ítem de
// riesgo agudo entre las 5 preguntas. Pendiente de confirmación del
// responsable clínico si en el futuro se quiere activar una alerta para
// "Familia disfuncional".

const ITEMS = [
  { numero: 1, texto: '¿Está satisfecho con la ayuda que recibe de su familia?' },
  { numero: 2, texto: '¿Discuten entre ustedes los problemas que tienen en casa?' },
  { numero: 3, texto: '¿Las decisiones importantes se toman en conjunto?' },
  { numero: 4, texto: '¿Está satisfecho con el tiempo que su familia y usted permanecen juntos?' },
  { numero: 5, texto: '¿Siente que su familia lo quiere?' },
];

const OPCIONES_FRECUENCIA = ['0 - Casi nunca', '1 - A veces', '2 - Casi siempre'];

export const INSTRUMENTO_APGAR_FAMILIAR = {
  titulo: 'Cuidado Primario De Salud Familiar',
  subtitulo:
    'Preguntas sobre cómo percibes el funcionamiento de tu familia. Indica con qué frecuencia se aplica cada situación.',
  tipoRespuesta: 'opciones',
  secciones: [
    {
      titulo: 'Cuidado Primario De Salud Familiar',
      intro: 'En cada caso, indica con qué frecuencia sientes o percibes cada situación en tu familia.',
      items: ITEMS.map((item) => ({ ...item, opciones: OPCIONES_FRECUENCIA })),
    },
  ],
};