// Instrumento: Inventario de Depresión de Beck II (BDI-II).
//
// Migrado desde el Observatorio de Salud Mental (SCRUM-54). 21 ítems de
// opción múltiple con texto completo por alternativa (el Observatorio
// original ya traía las anclas de texto acá, a diferencia de PSS-14/BAI).
// INSTRUMENTO_DEPRESION (al final del archivo) es la forma que consume
// FormularioInstrumento.jsx — tipoRespuesta 'opciones'.
//
// El cálculo ocurre del lado de la base de datos (trigger
// `calcular_resultado_instrumento`). Puntuación: suma directa de los 21
// ítems (los ítems 16 y 18 tienen variantes "a"/"b" que valen lo mismo,
// ej. "1a." y "1b." ambas suman 1 — igual que en el instrumento original).
// Puntaje total posible: 0-63. Categorías, tal como las traía el
// Observatorio (ver script.js del cliente):
//   0-10 Depresión mínima · 11-17 Depresión leve o media · 18-29
//   Depresión moderada · 30-63 Depresión severa.
//
// ⚠️ Ítem 9 — riesgo suicida (NO tocar el texto sin actualizar el trigger
// a la vez): a diferencia del Observatorio original, en esta plataforma
// cualquier respuesta distinta de "0. No tengo ningún pensamiento de
// matarme." activa `alerta_activada` de inmediato — mismo criterio de
// seguridad que las 3 preguntas de riesgo suicida del GSHS (ver
// gshsData.js). Esa alerta se calcula del lado de la base de datos,
// nunca en el cliente, comparando el texto exacto de este ítem. Si el
// texto de este ítem o de sus opciones cambia acá, hay que actualizar el
// trigger en la misma migración.

const ITEMS = [
  {
    numero: 1,
    texto: 'Tristeza',
    opciones: [
      '0. No me siento triste.',
      '1. Me siento triste gran parte del tiempo.',
      '2. Me siento triste todo el tiempo.',
      '3. Me siento tan triste o soy tan infeliz que no puedo soportarlo.',
    ],
  },
  {
    numero: 2,
    texto: 'Pesimismo',
    opciones: [
      '0. No estoy desalentado respecto de mi futuro.',
      '1. Me siento más desalentado respecto de mi futuro que lo que solía estarlo.',
      '2. No espero que las cosas funcionen para mí.',
      '3. Siento que no hay esperanza para mi futuro y que sólo puede empeorar.',
    ],
  },
  {
    numero: 3,
    texto: 'Sensación de fracaso',
    opciones: [
      '0. No me siento como un fracasado.',
      '1. He fracasado más de lo que hubiera debido.',
      '2. Cuando miro hacia atrás, veo muchos fracasos.',
      '3. Siento que como persona soy un fracaso total.',
    ],
  },
  {
    numero: 4,
    texto: 'Pérdida de placer',
    opciones: [
      '0. Obtengo tanto placer como siempre por las cosas de las que disfruto.',
      '1. No disfruto tanto de las cosas como solía hacerlo.',
      '2. Obtengo muy poco placer de las cosas que solía disfrutar.',
      '3. No puedo obtener ningún placer de las cosas de las que solía disfrutar.',
    ],
  },
  {
    numero: 5,
    texto: 'Sentimientos de culpa',
    opciones: [
      '0. No me siento particularmente culpable.',
      '1. Me siento culpable respecto de varias cosas que he hecho o que debería haber hecho.',
      '2. Me siento bastante culpable la mayor parte del tiempo.',
      '3. Me siento culpable todo el tiempo.',
    ],
  },
  {
    numero: 6,
    texto: 'Sentimientos de castigo',
    opciones: [
      '0. No siento que esté siendo castigado.',
      '1. Siento que tal vez pueda ser castigado.',
      '2. Espero ser castigado.',
      '3. Siento que estoy siendo castigado.',
    ],
  },
  {
    numero: 7,
    texto: 'Disconformidad con uno mismo',
    opciones: [
      '0. Siento acerca de mí lo mismo que siempre.',
      '1. He perdido la confianza en mí mismo.',
      '2. Estoy decepcionado conmigo mismo.',
      '3. No me gusto a mí mismo.',
    ],
  },
  {
    numero: 8,
    texto: 'Autocrítica',
    opciones: [
      '0. No me critico ni me culpo más de lo habitual.',
      '1. Estoy más crítico conmigo mismo de lo que solía estarlo.',
      '2. Me critico a mí mismo por todos mis errores.',
      '3. Me culpo a mí mismo por todo lo malo que sucede.',
    ],
  },
  {
    // Ítem de riesgo suicida — ver advertencia al inicio del archivo.
    numero: 9,
    texto: 'Pensamientos o deseos suicidas',
    opciones: [
      '0. No tengo ningún pensamiento de matarme.',
      '1. He tenido pensamientos de matarme, pero no lo haría.',
      '2. Querría matarme.',
      '3. Me mataría si tuviera la oportunidad de hacerlo.',
    ],
  },
  {
    numero: 10,
    texto: 'Llanto',
    opciones: [
      '0. No lloro más de lo que solía hacerlo.',
      '1. Lloro más de lo que solía hacerlo.',
      '2. Lloro por cualquier pequeñez.',
      '3. Siento ganas de llorar pero no puedo.',
    ],
  },
  {
    numero: 11,
    texto: 'Agitación',
    opciones: [
      '0. No estoy más inquieto o tenso que lo habitual.',
      '1. Me siento más inquieto o tenso que lo habitual.',
      '2. Estoy tan inquieto o agitado que me es difícil quedarme quieto.',
      '3. Estoy tan inquieto o agitado que tengo que estar siempre en movimiento o haciendo algo.',
    ],
  },
  {
    numero: 12,
    texto: 'Pérdida de interés',
    opciones: [
      '0. No he perdido el interés en otras actividades o personas.',
      '1. Estoy menos interesado que antes en otras personas o cosas.',
      '2. He perdido casi todo el interés en otras personas o cosas.',
      '3. Me es difícil interesarme por algo.',
    ],
  },
  {
    numero: 13,
    texto: 'Indecisión',
    opciones: [
      '0. Tomo mis propias decisiones tan bien como siempre.',
      '1. Me resulta más difícil que de costumbre tomar decisiones.',
      '2. Encuentro mucha más dificultad que antes para tomar decisiones.',
      '3. Tengo problemas para tomar cualquier decisión.',
    ],
  },
  {
    numero: 14,
    texto: 'Desvalorización',
    opciones: [
      '0. No siento que yo no sea valioso.',
      '1. No me considero a mí mismo tan valioso y útil como solía considerarme.',
      '2. Me siento menos valioso cuando me comparo con otros.',
      '3. Siento que no valgo nada.',
    ],
  },
  {
    numero: 15,
    texto: 'Pérdida de energía',
    opciones: [
      '0. Tengo tanta energía como siempre.',
      '1. Tengo menos energía que la que solía tener.',
      '2. No tengo suficiente energía para hacer demasiado.',
      '3. No tengo energía suficiente para hacer nada.',
    ],
  },
  {
    numero: 16,
    texto: 'Cambios en el patrón de sueño',
    nota: 'Elige la opción que mejor describa tu situación actual.',
    opciones: [
      '0. No he experimentado ningún cambio en mis hábitos de sueño.',
      '1a. Duermo un poco más que lo habitual.',
      '1b. Duermo un poco menos que lo habitual.',
      '2a. Duermo mucho más que lo habitual.',
      '2b. Duermo mucho menos que lo habitual.',
      '3a. Duermo la mayor parte del día.',
      '3b. Me despierto 1-2 horas más temprano y no puedo volver a dormirme.',
    ],
  },
  {
    numero: 17,
    texto: 'Irritabilidad',
    opciones: [
      '0. No estoy más irritable que lo habitual.',
      '1. Estoy más irritable que lo habitual.',
      '2. Estoy mucho más irritable que lo habitual.',
      '3. Estoy irritable todo el tiempo.',
    ],
  },
  {
    numero: 18,
    texto: 'Cambios en el apetito',
    nota: 'Elige la opción que mejor describa tu situación actual.',
    opciones: [
      '0. No he experimentado ningún cambio en mi apetito.',
      '1a. Mi apetito es un poco menor que lo habitual.',
      '1b. Mi apetito es un poco mayor que lo habitual.',
      '2a. Mi apetito es mucho menor que antes.',
      '2b. Mi apetito es mucho mayor que lo habitual.',
      '3a. No tengo apetito en absoluto.',
      '3b. Quiero comer todo el día.',
    ],
  },
  {
    numero: 19,
    texto: 'Dificultad de concentración',
    opciones: [
      '0. Puedo concentrarme tan bien como siempre.',
      '1. No puedo concentrarme tan bien como habitualmente.',
      '2. Me es difícil mantener la mente en algo por mucho tiempo.',
      '3. Encuentro que no puedo concentrarme en nada.',
    ],
  },
  {
    numero: 20,
    texto: 'Cansancio o fatiga',
    opciones: [
      '0. No estoy más cansado o fatigado que lo habitual.',
      '1. Me fatigo o me canso más fácilmente que lo habitual.',
      '2. Estoy demasiado fatigado o cansado para hacer muchas de las cosas que solía hacer.',
      '3. Estoy demasiado fatigado o cansado para hacer la mayoría de las cosas que solía hacer.',
    ],
  },
  {
    numero: 21,
    texto: 'Pérdida de interés en el sexo',
    opciones: [
      '0. No he notado ningún cambio reciente en mi interés por el sexo.',
      '1. Estoy menos interesado en el sexo de lo que solía estarlo.',
      '2. Estoy mucho menos interesado en el sexo.',
      '3. He perdido completamente el interés en el sexo.',
    ],
  },
];

export const INSTRUMENTO_DEPRESION = {
  titulo: 'Inventario de Depresión de Beck II (BDI-II)',
  subtitulo: 'Elige, en cada grupo, la frase que mejor describa cómo te has sentido durante las últimas dos semanas.',
  tipoRespuesta: 'opciones',
  secciones: [
    {
      titulo: 'Inventario de Depresión de Beck II (BDI-II)',
      intro: 'En cada grupo hay varias frases. Elige la que mejor describa cómo te has sentido en las últimas dos semanas, incluyendo hoy.',
      items: ITEMS,
    },
  ],
};