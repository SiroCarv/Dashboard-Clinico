// Instrumento: Cuestionario para Detección de Riesgo Suicida en
// Adolescentes — adaptado del cuestionario en papel que ya usaba el
// cliente (test2.html/script2.js) para integrarlo a la plataforma junto
// con Estrés/Ansiedad/Depresión/Cuidado Primario, respondido por Persona
// Particular (ver Encuesta.jsx).
//
// 25 preguntas, cada una con 3 opciones de frecuencia: Nunca (0),
// Algunas veces (1), Muchas veces (2). INSTRUMENTO_RIESGO_SUICIDA usa
// tipoRespuesta 'opciones', igual que Estrés/Ansiedad/Depresión/Cuidado
// Primario — no hizo falta ningún componente de UI nuevo.
//
// El cálculo del resultado ocurre del lado de la base de datos (trigger
// calcular_resultado_instrumento, rama RIESGO_SUICIDA), nunca acá ni en
// el cliente — mismo criterio que el resto de los instrumentos.
//   Puntaje total posible: 0-50 (suma directa de las 25 respuestas).
//   Categorías (tal cual el cuestionario original en papel):
//     0-18  Riesgo Leve
//     19-38 Riesgo Moderado
//     39-50 Riesgo Alto (alerta_activada = true)
//   El nombre "Riesgo Alto" para el tercer tramo es una decisión de
//   consistencia con el resto del sistema — el cuestionario original
//   solo decía "comunícate con un profesional" para ese rango. Pendiente
//   de que el responsable clínico lo confirme, igual que el resto de
//   los rangos de este trigger.
//
// OJO — preguntas 4, 16 y 17 (higiene, sueño, alimentación) están
// redactadas en positivo: responder "Muchas veces" a "¿mantienes buenos
// hábitos de higiene?" es una buena señal, no de riesgo. El cuestionario
// original (script2.js) las suma exactamente igual que las demás, sin
// invertir su puntaje — se preservó tal cual, sin "corregirlo" acá, para
// no alterar un instrumento ya validado por el cliente sin su
// autorización explícita. Vale la pena confirmarlo con el responsable
// clínico antes de dar esta historia por cerrada.
const ITEMS = [
  { numero: 1, texto: '¿Tienes conflictos frecuentes con tu familia?' },
  { numero: 2, texto: '¿Tienes conflictos con tus compañeros/as?' },
  { numero: 3, texto: '¿Actúas de forma violenta en casa o en el instituto?' },
  { numero: 4, texto: '¿Mantienes unos hábitos adecuados de higiene y aseo personal?' },
  { numero: 5, texto: '¿En tu familia ha habido algún suicidio?' },
  { numero: 6, texto: '¿Tomas drogas o alcohol?' },
  { numero: 7, texto: '¿Tu rendimiento académico es bajo?' },
  { numero: 8, texto: '¿Tienes problemas sentimentales?' },
  { numero: 9, texto: '¿Has tenido abuso sexual?' },
  { numero: 10, texto: '¿Has recibido maltrato físico?' },
  { numero: 11, texto: '¿Te aburres continuamente?' },
  { numero: 12, texto: '¿Tus padres toman drogas o alcohol?' },
  { numero: 13, texto: '¿Te sientes estresado/a?' },
  { numero: 14, texto: '¿Tienes alucinaciones o pensamientos extraños?' },
  { numero: 15, texto: '¿Has vivido algún suceso de acoso?' },
  { numero: 16, texto: '¿Duermes con normalidad?' },
  { numero: 17, texto: '¿Comes bien de forma habitual?' },
  { numero: 18, texto: '¿Tienes dolores de cabeza, estómago o ansiedad?' },
  { numero: 19, texto: '¿Piensas que eres una mala persona?' },
  { numero: 20, texto: '¿Te muestras poco tolerante a los elogios o a los premios?' },
  { numero: 21, texto: '¿Tienes alguna situación familiar que te preocupe?' },
  { numero: 22, texto: 'Lanzas indirectas a familiares o amigos/as del tipo "no me veréis más", "nada me importa"...' },
  { numero: 23, texto: '¿Has deseado alguna vez estar muerto/a?' },
  { numero: 24, texto: '¿Has pensado alguna vez terminar con tu vida?' },
  { numero: 25, texto: '¿Has intentado suicidarte?' },
];

const OPCIONES_FRECUENCIA = ['0 - Nunca', '1 - Algunas veces', '2 - Muchas veces'];

export const INSTRUMENTO_RIESGO_SUICIDA = {
  titulo: 'Cuestionario para Detección de Riesgo Suicida',
  subtitulo: 'En cada caso, indica con qué frecuencia se aplica esta situación en tu vida.',
  tipoRespuesta: 'opciones',
  secciones: [
    {
      titulo: 'Cuestionario para Detección de Riesgo Suicida',
      intro: 'Responde con sinceridad cada una de las siguientes preguntas.',
      items: ITEMS.map((item) => ({ ...item, opciones: OPCIONES_FRECUENCIA })),
    },
  ],
};