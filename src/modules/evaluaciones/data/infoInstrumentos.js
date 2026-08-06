// Texto de apoyo para el aviso flotante que se muestra al seleccionar
// cada instrumento (ver AvisoInstrumento.jsx). Los tiempos son una
// estimación en base a la cantidad de preguntas de cada instrumento
// (Clima de Aula: 20 ítems Verdadero/Falso · GSHS: ~62 ítems de opción
// múltiple repartidos en varios módulos), ya que el documento de
// consentimiento del cliente solo da un tiempo agregado de 30 a 45
// minutos para todo el paquete, no por formulario. Pendiente de que el
// responsable clínico confirme o ajuste estos dos rangos.
export const INFO_INSTRUMENTO = {
  clima_aula: {
    tiempoEstimado: '5 a 8 minutos',
    objetivo:
      'Conocer cómo percibes el ambiente de tu salón de clases: el interés y la motivación, el compañerismo, la relación con tus docentes y el trabajo en equipo.',
    deQueTrata: '20 afirmaciones cortas que respondes como Verdadero o Falso, agrupadas en 4 temas.',
  },
  gshs: {
    tiempoEstimado: '20 a 25 minutos',
    objetivo:
      'Conocer de forma general tus hábitos de salud y cómo te has sentido últimamente, para poder identificar a tiempo si necesitas apoyo.',
    deQueTrata:
      'Preguntas de opción múltiple organizadas en varios módulos cortos: datos generales, hábitos de salud y bienestar emocional, entre otros.',
  },
};
