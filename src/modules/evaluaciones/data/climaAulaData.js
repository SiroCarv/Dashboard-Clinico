// Instrumento: Cuestionario de Clima de Aula
// (Adaptación de Gina del Carmen Anchundia Rivadeneira, 2011).
//
// 20 afirmaciones que se responden como Verdadero/Falso, agrupadas en 4
// dimensiones. INSTRUMENTO_CLIMA_AULA (al final del archivo) es la forma
// que consume FormularioInstrumento.jsx para renderizar el formulario
// real y calcular el envío.
//
// El cálculo del resultado (puntaje + categoría) ocurre del lado de la
// base de datos, nunca acá ni en el cliente — ver el trigger
// `calcular_resultado_instrumento()` sobre la tabla
// `evaluaciones_instrumento`. Las reglas que usa ese trigger, para
// referencia:
//   Puntaje por dimensión — Interés y Motivación: ítems 1-5 (máx. 5 pts) ·
//   Compañerismo: ítems 6-9 (máx. 4 pts) · Relación Docente-Estudiante:
//   ítems 10-16 (máx. 7 pts) · Trabajo en Equipo: ítems 17-20 (máx. 4 pts).
//   Total posible: 20 puntos.
//   Interpretación: 17-20 Muy positivo · 13-16 Positivo · 9-12 Medianamente
//   favorable · 5-8 Poco favorable · 0-4 Negativo.
//
// NIVELES_CLIMA_AULA (SCRUM-58) es la versión consumible de esa misma
// interpretación: antes vivía solo en este comentario, y la Leyenda de
// resultados (dashboard_clinico/components/LeyendaClimaAula.jsx) necesita
// los 5 rangos como datos, no como texto. Si el trigger cambia de rangos,
// actualizar acá también — son la misma regla de negocio en dos lugares
// (base de datos y frontend) porque el cálculo real nunca puede vivir en
// el cliente, pero la leyenda sí necesita conocer los rangos para
// dibujarlos.

const ITEMS_POR_DIMENSION = [
  {
    dimension: 'Interés y Motivación',
    items: [
      { numero: 1, texto: 'Los/Las estudiantes ponen mucho interés en lo que se hace en clases.' },
      { numero: 2, texto: 'Los/Las estudiantes ponen realmente atención a lo que dicen los docentes.' },
      { numero: 3, texto: 'La mayoría de los/las estudiantes participan en las discusiones o actividades de clase.' },
      { numero: 4, texto: 'En clase, a veces, los/las estudiantes hacen trabajos extra por su cuenta.' },
      { numero: 5, texto: 'A los/las estudiantes realmente les agradan las clases.' },
    ],
  },
  {
    dimension: 'Compañerismo',
    items: [
      { numero: 6, texto: 'En clase, los/las estudiantes llegan a conocerse bien entre sí.' },
      { numero: 7, texto: 'En esta clase se hacen muchas amistades.' },
      { numero: 8, texto: 'En clase, se tarda poco tiempo en conocer a todos y todas por su nombre.' },
      { numero: 9, texto: 'La mayoría de los compañeros/as se llevan bien en clase.' },
    ],
  },
  {
    dimension: 'Relación Docente-Estudiante',
    items: [
      { numero: 10, texto: 'Los/Las profesores/as muestran interés personal por los/las estudiantes.' },
      { numero: 11, texto: 'Los/Las profesores/as parecen amigos/as más que una autoridad.' },
      { numero: 12, texto: 'Los/Las profesores/as hacen más de lo que deben para ayudar a los alumnos/as.' },
      { numero: 13, texto: 'Los/Las profesores/as no "avergüenzan" al alumno/a por no saber las respuestas.' },
      { numero: 14, texto: 'Si en clase queremos hablar de un tema, los/las profesores/as buscan tiempo para hacerlo.' },
      { numero: 15, texto: 'Los/Las profesores/as quieren saber qué es lo que les interesa saber a los/las estudiantes.' },
      { numero: 16, texto: 'Los/Las profesores/as confían en los/las estudiantes.' },
    ],
  },
  {
    dimension: 'Trabajo en Equipo',
    items: [
      { numero: 17, texto: 'En esta clase se forman grupos para realizar proyectos o tareas con facilidad.' },
      { numero: 18, texto: 'En esta clase a los/las estudiantes les agrada colaborar en los trabajos.' },
      { numero: 19, texto: 'A los/las estudiantes les gusta ayudarse entre sí para hacer sus deberes.' },
      { numero: 20, texto: 'Frecuentemente los/las estudiantes presentan a sus compañeros/as algunos trabajos.' },
    ],
  },
];

// Orden de mayor a menor puntaje a propósito: es el orden en que se
// dibuja la Leyenda de resultados (SCRUM-58), de "mejor" clima a "peor".
export const NIVELES_CLIMA_AULA = [
  { categoria: 'Muy positivo', puntajeMinimo: 17, puntajeMaximo: 20 },
  { categoria: 'Positivo', puntajeMinimo: 13, puntajeMaximo: 16 },
  { categoria: 'Medianamente favorable', puntajeMinimo: 9, puntajeMaximo: 12 },
  { categoria: 'Poco favorable', puntajeMinimo: 5, puntajeMaximo: 8 },
  { categoria: 'Negativo', puntajeMinimo: 0, puntajeMaximo: 4 },
];

// dashboard_clinico no necesita conocer la estructura por dimensión, solo
// consume este objeto a través de la API pública del módulo
// (`evaluaciones/index.js`).
export const INSTRUMENTO_CLIMA_AULA = {
  titulo: 'Cuestionario de Clima de Aula',
  subtitulo:
    'Valora Interés y motivación, Compañerismo, Relación docente-estudiante y Trabajo en equipo. Cada afirmación se responde como Verdadero o Falso.',
  tipoRespuesta: 'verdadero_falso',
  secciones: ITEMS_POR_DIMENSION.map(({ dimension, items }) => ({
    titulo: dimension,
    items,
  })),
};