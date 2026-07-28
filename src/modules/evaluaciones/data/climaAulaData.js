// Instrumento: Cuestionario de Clima de Aula
// (Adaptación de Gina del Carmen Anchundia Rivadeneira, 2011).
//
// Historia "Vista Previa de Nuevos Instrumentos Clínicos (Clima de Aula y
// GSHS)": este archivo solo alimenta la vista de SOLO LECTURA. No calcula
// puntaje, no guarda nada en Supabase y no está conectado a
// `historial_evaluaciones` todavía — eso queda para una historia posterior,
// una vez el cliente confirme cómo debe generalizarse el esquema para
// convivir con el PHQ-9.

const ITEMS_POR_DIMENSION = [
  {
    dimension: 'Interés y Motivación',
    items: [
      { numero: 1, texto: 'Las estudiantes ponen mucho interés en lo que se hace en clases.' },
      { numero: 2, texto: 'Las estudiantes ponen realmente atención a lo que dicen los docentes.' },
      { numero: 3, texto: 'La mayoría de las estudiantes participan en las discusiones o actividades de clase.' },
      { numero: 4, texto: 'En clase, a veces, las estudiantes hacen trabajos extra por su cuenta.' },
      { numero: 5, texto: 'A las estudiantes realmente les agradan las clases.' },
    ],
  },
  {
    dimension: 'Compañerismo',
    items: [
      { numero: 6, texto: 'En clase, las estudiantes llegan a conocerse bien entre ellas.' },
      { numero: 7, texto: 'En esta clase se hacen muchas amistades.' },
      { numero: 8, texto: 'En clase, se tarda poco tiempo en conocer a todas por su nombre.' },
      { numero: 9, texto: 'La mayoría de las compañeras se llevan bien en clase.' },
    ],
  },
  {
    dimension: 'Relación Docente-Estudiante',
    items: [
      { numero: 10, texto: 'Los profesores muestran interés personal por las estudiantes.' },
      { numero: 11, texto: 'Los profesores parecen amigos más que una autoridad.' },
      { numero: 12, texto: 'Los profesores hacen más de lo que deben para ayudar a las alumnas.' },
      { numero: 13, texto: 'Los profesores no "avergüenzan" al alumno por no saber las respuestas.' },
      { numero: 14, texto: 'Si en clase queremos hablar de un tema, los profesores buscan tiempo para hacerlo.' },
      { numero: 15, texto: 'Los profesores quieren saber qué es lo que les interesa saber a las estudiantes.' },
      { numero: 16, texto: 'Los profesores confían en las estudiantes.' },
    ],
  },
  {
    dimension: 'Trabajo en Equipo',
    items: [
      { numero: 17, texto: 'En esta clase se forman grupos para realizar proyectos o tareas con facilidad.' },
      { numero: 18, texto: 'En esta clase a las estudiantes les agrada colaborar en los trabajos.' },
      { numero: 19, texto: 'A las estudiantes les gusta ayudarse unas a otras para hacer sus deberes.' },
      { numero: 20, texto: 'Frecuentemente las estudiantes presentan a sus compañeras algunos trabajos.' },
    ],
  },
];

// Forma ya lista para <VistaInstrumentoSoloLectura />: dashboard_clinico no
// necesita conocer la estructura por dimensión, solo consume este objeto
// a través de la API pública del módulo (`evaluaciones/index.js`).
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

// Pendiente para la historia de cálculo (fuera de alcance de esta vista):
//   Puntaje por dimensión — Interés y Motivación: ítems 1-5 (máx. 5 pts) ·
//   Compañerismo: ítems 6-9 (máx. 4 pts) · Relación Docente-Estudiante:
//   ítems 10-16 (máx. 7 pts) · Trabajo en Equipo: ítems 17-20 (máx. 4 pts).
//   Total posible: 20 puntos.
//   Interpretación: 17-20 Muy positivo · 13-16 Positivo · 9-12 Medianamente
//   favorable · 5-8 Poco favorable · 0-4 Negativo.