// Instrumento: Cuestionario sobre Intimidación y Maltrato entre Iguales
// (Bullying) — adaptado de Ortega, Mora-Merchán y Mora, entregado por el
// cliente (test_de_bulling_rev.docx). Exclusivo de Estudiante/colegio:
// va en TABS de Encuesta.jsx, nunca en TABS_PERSONA_PARTICULAR (esto ya
// estaba anticipado ahí desde antes de esta historia).
//
// A diferencia del resto de los instrumentos, mezcla dos tipos de
// respuesta DENTRO del mismo cuestionario: las preguntas 4, 5, 8, 9 y 10
// permiten elegir más de una opción (marcadas acá con `multiple: true` —
// ver el soporte nuevo en FormularioInstrumento.jsx/
// useFormularioInstrumento.js). Las demás son de opción única, como
// siempre.
//
// Calificación (calcular_resultado_instrumento en Supabase, nunca en el
// cliente): no hay puntaje, sino un nivel — "Sin indicios", "Bullying
// moderado" o "Bullying alto" — que sale de la respuesta más alta entre:
//   - victimización: pregunta 2 (cuántas veces lo intimidaron) y 3
//     (desde cuándo);
//   - agresión: pregunta 7 (cuánto intimida a otros).
// La pregunta 11 (cuánto bullying observa en el colegio) se guarda como
// dato de "ambiente" pero NO sube el nivel de la persona. "Bullying alto"
// activa alerta_activada, igual que "Riesgo Alto" en Riesgo Suicida.
// ⚠️ El trigger compara el TEXTO EXACTO de las opciones de las preguntas
// 2, 3, 7 y 11: si cambian acá, hay que actualizarlo en la base a la vez.
// Los umbrales los propuso el equipo técnico y están pendientes de
// validación clínica de la Licenciada.

const ITEMS = [
  {
    numero: 1,
    texto: '¿Cuáles son en tu opinión las formas más frecuentes de maltrato entre compañeros/as?',
    opciones: [
      'Insultar, poner apodos.',
      'Reírse de alguien, dejar en ridículo.',
      'Hacer daño físico (pegar, dar patadas, empujar).',
      'Hablar mal de alguien.',
      'Amenazar, chantajear, obligar a hacer cosas.',
      'Rechazar, aislar, no juntarse con alguien, no dejar participar.',
      'Otros.',
    ],
  },
  {
    numero: 2,
    texto: '¿Cuántas veces, en este curso, te han intimidado o maltratado algunos/as de tus compañeros/as?',
    opciones: ['Nunca.', 'Pocas veces.', 'Bastantes veces.', 'Casi todos los días, casi siempre.'],
  },
  {
    numero: 3,
    texto: 'Si tus compañeros/as te han intimidado en alguna ocasión ¿desde cuándo se producen estas situaciones?',
    opciones: [
      'Nadie me ha intimidado nunca.',
      'Desde hace poco, unas semanas.',
      'Desde hace unos meses.',
      'Durante todo el curso.',
      'Desde siempre.',
    ],
  },
  {
    numero: 4,
    texto: '¿En qué lugares se suelen producir estas situaciones de intimidación?',
    nota: 'Podés marcar más de una opción.',
    multiple: true,
    opciones: [
      'En la clase cuando está algún profesor/a.',
      'En la clase cuando no hay ningún profesor/a.',
      'En los pasillos del Instituto.',
      'En los aseos.',
      'En el patio cuando vigila algún profesor/a.',
      'En el patio cuando no vigila ningún profesor/a.',
      'Cerca del Instituto, al salir de clase.',
      'En la calle.',
    ],
  },
  {
    numero: 5,
    texto: 'Si alguien te intimida ¿hablas con alguien de lo que te sucede?',
    nota: 'Podés marcar más de una opción.',
    multiple: true,
    opciones: [
      'Nadie me intimida.',
      'No hablo con nadie.',
      'Con los/as profesores/as.',
      'Con mi familia.',
      'Con compañeros/as.',
    ],
  },
  {
    numero: 6,
    texto: '¿Quién suele parar las situaciones de intimidación?',
    opciones: [
      'Nadie.',
      'Algún profesor.',
      'Alguna profesora.',
      'Otros adultos.',
      'Algunos compañeros.',
      'Algunas compañeras.',
      'No lo sé.',
    ],
  },
  {
    numero: 7,
    texto: '¿Has intimidado o maltratado a algún compañero o a alguna compañera?',
    opciones: ['Nunca me meto con nadie.', 'Alguna vez.', 'Con cierta frecuencia.', 'Casi todos los días.'],
  },
  {
    numero: 8,
    texto: 'Si te han intimidado en alguna ocasión ¿Por qué crees que lo hicieron?',
    nota: 'Podés marcar más de una opción.',
    multiple: true,
    opciones: [
      'Nadie me ha intimidado nunca.',
      'No lo sé.',
      'Porque los provoqué.',
      'Porque soy diferente a ellos.',
      'Porque soy más débil.',
      'Por molestarme.',
      'Por gastarme una broma.',
      'Porque me lo merezco.',
      'Otros.',
    ],
  },
  {
    numero: 9,
    texto: 'Si has participado en situaciones de intimidación hacia tus compañeros/as ¿por qué lo hiciste?',
    nota: 'Podés marcar más de una opción.',
    multiple: true,
    opciones: [
      'No he intimidado a nadie.',
      'Porque me provocaron.',
      'Porque a mí me lo hacen otros/as.',
      'Porque son diferentes (gitanos, deficientes, extranjeros, payos, de otros sitios...)',
      'Porque eran más débiles.',
      'Por molestar.',
      'Por gastar una broma.',
      'Otros.',
    ],
  },
  {
    numero: 10,
    texto: '¿Por qué crees que algunos/as chicos/as intimidan a otros/as?',
    nota: 'Podés marcar más de una opción.',
    multiple: true,
    opciones: ['Por molestar.', 'Porque se meten con ellos/as.', 'Porque son más fuertes.', 'Por gastar una broma.', 'Otras razones.'],
  },
  {
    numero: 11,
    texto:
      '¿Con qué frecuencia han ocurrido intimidaciones (poner apodos, dejar en ridículo, pegar, dar patadas, empujar, amenazas, rechazos, no juntarse, etc.) en tu Instituto durante el trimestre?',
    opciones: [
      'Nunca.',
      'Menos de cinco veces.',
      'Entre cinco y diez veces.',
      'Entre diez y veinte veces.',
      'Más de veinte veces.',
      'Todos los días.',
    ],
  },
  {
    numero: 12,
    texto: '¿Qué tendría que suceder para que se arreglase este problema?',
    opciones: [
      'No se puede arreglar.',
      'No sé.',
      'Que hagan algo los/as profesores/as.',
      'Que hagan algo las familias.',
      'Que hagan algo los/as compañeros/as.',
    ],
  },
];

export const INSTRUMENTO_BULLYING = {
  titulo: 'Cuestionario sobre Intimidación y Maltrato entre Iguales',
  subtitulo:
    'Adaptado de Ortega, Mora-Merchán y Mora. Dato de referencia para el psicólogo — no genera un diagnóstico ni un puntaje único.',
  tipoRespuesta: 'opciones',
  secciones: [
    {
      titulo: 'Cuestionario sobre Intimidación y Maltrato entre Iguales',
      intro: 'Respondé con sinceridad cada una de las siguientes preguntas sobre tu experiencia en el colegio.',
      items: ITEMS,
    },
  ],
};