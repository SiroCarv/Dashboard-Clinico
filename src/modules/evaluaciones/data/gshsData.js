// Instrumento: Encuesta Mundial de Salud a Escolares — Global School-based
// Student Health Survey (GSHS), adaptación de términos y ejemplos para el
// Estado Plurinacional de Bolivia.
//
// Historia "Vista Previa de Nuevos Instrumentos Clínicos (Clima de Aula y
// GSHS)": este archivo solo alimenta la vista de SOLO LECTURA. No calcula
// prevalencia, no guarda nada en Supabase y no está conectado a
// `historial_evaluaciones` todavía.
//
// Aclaración del cliente (no tocar sin confirmar de nuevo): a diferencia
// del PHQ-9, la GSHS NO genera un puntaje único ni un diagnóstico — son
// datos sociodemográficos para que el psicólogo los cruce manualmente con
// los resultados de otros tests. El sistema solo alerta; no diagnostica.
// Las preguntas 3, 4 y 5 del módulo "Salud Mental" (ideación, planificación
// e intento de suicidio) sí requieren derivación inmediata cuando la
// respuesta es afirmativa — esa lógica de alerta puntual queda para la
// historia de almacenamiento real, no para esta vista previa.

const MODULOS = [
  {
    titulo: 'Módulo de Información Demográfica',
    intro: 'Las siguientes preguntas identifican datos generales del estudiante.',
    items: [
      {
        numero: 1,
        texto: '¿Qué edad tienes?',
        opciones: ['11 años o menos', '12 años', '13 años', '14 años', '15 años', '16 años o más'],
      },
      { numero: 2, texto: '¿Cuál es tu sexo?', opciones: ['Masculino', 'Femenino'] },
      {
        numero: 3,
        texto: '¿En qué curso o nivel de secundaria estás?',
        nota: 'Opciones adaptadas al sistema educativo boliviano (Ley 070 "Avelino Siñani – Elizardo Pérez").',
        opciones: [
          '1° de Secundaria', '2° de Secundaria', '3° de Secundaria',
          '4° de Secundaria', '5° de Secundaria', '6° de Secundaria',
        ],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Uso de Alcohol',
    intro:
      'Las próximas 6 preguntas se refieren al consumo de bebidas alcohólicas. Esto incluye la ingestión de cerveza, vino, singani, chicha, whisky u otras bebidas destiladas. El consumo de alcohol no incluye beber unos pocos sorbos de vino de consagrar durante la misa o actividades religiosas. Una "bebida estándar" equivale a un vaso de vino o chicha (140 ml), una botella o lata de cerveza (330 ml), o una medida de singani u otro destilado (40 ml).',
    items: [
      {
        numero: 1,
        texto: '¿Qué edad tenías cuando tomaste tu primer trago de alcohol (cerveza, vino, chicha, singani u otra bebida), algo más que unos pocos sorbos?',
        opciones: ['Nunca he bebido alcohol aparte de unos pocos sorbos', '7 años o menos', '8 ó 9 años', '10 ó 11 años', '12 ó 13 años', '14 ó 15 años', '16 años o más'],
      },
      {
        numero: 2,
        texto: 'Durante los últimos 30 días, ¿en cuántos días tomaste al menos una bebida que contenía alcohol?',
        opciones: ['0 días', '1 ó 2 días', '3 a 5 días', '6 a 9 días', '10 a 19 días', '20 a 29 días', 'Los 30 días'],
      },
      {
        numero: 3,
        texto: 'Durante los últimos 30 días, en los días en que tomaste alcohol, ¿cuántos tragos tomaste normalmente por día?',
        opciones: ['No tomé alcohol durante los últimos 30 días', 'Menos de un trago', '1 trago', '2 tragos', '3 tragos', '4 tragos', '5 tragos o más'],
      },
      {
        numero: 4,
        texto: 'Durante los últimos 30 días, ¿cómo conseguiste normalmente el alcohol que tomaste? SELECCIONA SÓLO UNA RESPUESTA.',
        opciones: ['No tomé alcohol durante los últimos 30 días', 'Lo compré en una tienda, licorería, mercado o en la calle', 'Le di dinero a otra persona para que lo comprara por mí', 'Lo conseguí de mis amigos', 'Lo conseguí en mi casa', 'Lo robé', 'Lo hice yo mismo (chicha casera u otra bebida preparada)', 'Lo conseguí de otra manera'],
      },
      {
        numero: 5,
        texto: 'Durante tu vida, ¿cuántas veces tomaste tanto alcohol que llegaste a emborracharte?',
        nota: 'Tambalearse al caminar, no poder hablar correctamente y vomitar son algunos signos de estar borracho.',
        opciones: ['0 veces', '1 ó 2 veces', '3 a 9 veces', '10 o más veces'],
      },
      {
        numero: 6,
        texto: 'Durante tu vida, ¿cuántas veces has tenido problemas con tu familia o amigos, has faltado a la escuela o te has metido en peleas como resultado de tomar alcohol?',
        opciones: ['0 veces', '1 ó 2 veces', '3 a 9 veces', '10 o más veces'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Conductas Alimentarias',
    intro: 'Las siguientes preguntas se refieren a tu estatura, peso, y a lo que comes y bebes.',
    items: [
      {
        numero: 1,
        texto: '¿Cuál es tu estatura, sin zapatos?',
        nota: 'En la hoja de respuestas, escribe tu estatura en centímetros en las casillas correspondientes.',
        opciones: [],
      },
      {
        numero: 2,
        texto: '¿Cuánto pesas, sin zapatos?',
        nota: 'En la hoja de respuestas, escribe tu peso en kilogramos en las casillas correspondientes.',
        opciones: [],
      },
      {
        numero: 3,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia te quedaste con hambre porque no había suficiente comida en tu hogar?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 4,
        texto: 'Durante los últimos 30 días, ¿cuántas veces al día comiste habitualmente frutas, como plátano, mango, papaya, naranja, uva o manzana?',
        opciones: ['No comí frutas en los últimos 30 días', 'Menos de una vez al día', '1 vez al día', '2 veces al día', '3 veces al día', '4 veces al día', '5 o más veces al día'],
      },
      {
        numero: 5,
        texto: 'Durante los últimos 30 días, ¿cuántas veces al día comiste habitualmente verduras y hortalizas, como tomate, lechuga, zanahoria, cebolla o locoto?',
        opciones: ['No comí verduras ni hortalizas durante los últimos 30 días', 'Menos de una vez al día', '1 vez al día', '2 veces al día', '3 veces al día', '4 veces al día', '5 o más veces al día'],
      },
      {
        numero: 6,
        texto: 'Durante los últimos 30 días, ¿cuántas veces al día tomaste gaseosas o bebidas como Coca-Cola, Pepsi, Fanta o Simba?',
        opciones: ['No tomé gaseosas en los últimos 30 días', 'Menos de una vez al día', '1 vez al día', '2 veces al día', '3 veces al día', '4 veces al día', '5 o más veces al día'],
      },
      {
        numero: 7,
        texto: "Durante los últimos 7 días, ¿cuántos días comiste en un restaurante de comida rápida, como Pollos Copacabana, Chaplin's, Burger King u otro similar?",
        opciones: ['0 días', '1 día', '2 días', '3 días', '4 días', '5 días', '6 días', '7 días'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Uso de Drogas',
    intro: 'Las siguientes preguntas se refieren al uso de drogas. Esto incluye el uso de marihuana (también conocida como "mota", "maría" o "hierba"), inhalantes (como clefa o thinner), anfetaminas, cocaína o pasta base.',
    items: [
      {
        numero: 1,
        texto: '¿Qué edad tenías cuando usaste drogas por primera vez?',
        opciones: ['Nunca usé drogas', '7 años o menos', '8 ó 9 años', '10 ó 11 años', '12 ó 13 años', '14 ó 15 años', '16 años o más'],
      },
      {
        numero: 2,
        texto: 'Durante tu vida, ¿cuántas veces has usado marihuana (también conocida como "mota", "maría" o "hierba")?',
        opciones: ['0 veces', '1 ó 2 veces', '3 a 9 veces', '10 a 19 veces', '20 veces o más'],
      },
      {
        numero: 3,
        texto: 'Durante los últimos 30 días, ¿cuántas veces has usado marihuana (también conocida como "mota", "maría" o "hierba")?',
        opciones: ['0 veces', '1 ó 2 veces', '3 a 9 veces', '10 a 19 veces', '20 veces o más'],
      },
      {
        numero: 4,
        texto: 'Durante tu vida, ¿cuántas veces has usado anfetaminas o metanfetaminas (también conocidas como "pastillas" o "éxtasis") o inhalantes como clefa o thinner?',
        opciones: ['0 veces', '1 ó 2 veces', '3 a 9 veces', '10 a 19 veces', '20 veces o más'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Higiene',
    intro: 'Las próximas 4 preguntas se refieren a la limpieza de los dientes y el lavado de manos.',
    items: [
      {
        numero: 1,
        texto: 'Durante los últimos 30 días, ¿cuántas veces al día generalmente te limpiaste o cepillaste los dientes?',
        opciones: ['No me limpié ni cepillé los dientes en los últimos 30 días', '1 vez al día', '2 veces al día', '3 veces al día', '4 o más veces al día'],
      },
      {
        numero: 2,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia te lavaste las manos antes de comer?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 3,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia te lavaste las manos después de usar el baño o la letrina?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 4,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia usaste jabón al lavarte las manos?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Salud Mental',
    intro: 'Las próximas 6 preguntas se refieren a tus sentimientos y amistades.',
    items: [
      {
        numero: 1,
        texto: 'Durante los últimos 12 meses, ¿con qué frecuencia te has sentido solo o sola?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 2,
        texto: 'Durante los últimos 12 meses, ¿con qué frecuencia has estado tan preocupado/a por algo que no podías dormir por la noche?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 3,
        texto: 'Durante los últimos 12 meses, ¿alguna vez consideraste seriamente la posibilidad de suicidarte?',
        opciones: ['Sí', 'No'],
      },
      {
        numero: 4,
        texto: 'Durante los últimos 12 meses, ¿has hecho algún plan de cómo intentarías suicidarte?',
        opciones: ['Sí', 'No'],
      },
      {
        numero: 5,
        texto: 'Durante los últimos 12 meses, ¿cuántas veces intentaste realmente suicidarte?',
        opciones: ['0 veces', '1 vez', '2 ó 3 veces', '4 ó 5 veces', '6 veces o más'],
      },
      { numero: 6, texto: '¿Cuántos amigos o amigas muy cercanos tienes?', opciones: ['0', '1', '2', '3 o más'] },
    ],
  },
  {
    titulo: 'Módulo sobre Actividad Física',
    intro: 'Las próximas preguntas se refieren a tu actividad física. Actividad física es cualquier actividad que acelera los latidos del corazón y te deja sin aliento algunas veces, como correr, caminar rápido, andar en bicicleta, bailar, jugar fútbol, básquet o vóley.',
    items: [
      {
        numero: 1,
        texto: 'Durante los últimos 7 días, ¿cuántos días practicaste actividad física por un total de al menos 60 minutos al día?',
        nota: 'Suma todo el tiempo que pasas haciendo algún tipo de actividad física cada día.',
        opciones: ['0 días', '1 día', '2 días', '3 días', '4 días', '5 días', '6 días', '7 días'],
      },
      {
        numero: 2,
        texto: 'Durante los últimos 7 días, ¿cuántos días fuiste de tu casa a la escuela o regresaste caminando o en bicicleta?',
        opciones: ['0 días', '1 día', '2 días', '3 días', '4 días', '5 días', '6 días', '7 días'],
      },
      {
        numero: 3,
        texto: 'En este año escolar, ¿cuántos días a la semana fuiste a clase de educación física en la escuela?',
        opciones: ['0 días', '1 día', '2 días', '3 días', '4 días', '5 días o más'],
      },
      {
        numero: 4,
        texto: 'Durante un día típico, ¿cuánto tiempo pasas sentado/a viendo televisión, jugando videojuegos, usando el celular o el WhatsApp, o haciendo otras cosas sentado/a, fuera del horario escolar?',
        opciones: ['Menos de 1 hora al día', '1 a 2 horas al día', '3 a 4 horas al día', '5 a 6 horas al día', '7 a 8 horas al día', 'Más de 8 horas al día'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Factores Protectores',
    intro: 'Las próximas preguntas se refieren a tus experiencias personales en la escuela y en casa.',
    items: [
      {
        numero: 1,
        texto: 'Durante los últimos 30 días, ¿cuántos días faltaste a clases o a la escuela sin permiso?',
        opciones: ['0 días', '1 ó 2 días', '3 a 5 días', '6 a 9 días', '10 días o más'],
      },
      {
        numero: 2,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia la mayoría de tus compañeros/as de escuela fueron amables contigo y te prestaron ayuda?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 3,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia verificaron tus padres o cuidadores que hacías la tarea?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 4,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia entendieron tus padres o cuidadores tus problemas y preocupaciones?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 5,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia tus padres o cuidadores realmente sabían lo que estabas haciendo en tu tiempo libre?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
      {
        numero: 6,
        texto: 'Durante los últimos 30 días, ¿con qué frecuencia tus padres o cuidadores buscaron entre tus cosas sin tu permiso?',
        opciones: ['Nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Comportamientos Sexuales que Contribuyen a la Infección por VIH, Otras ITS y Embarazos No Planeados',
    intro: 'Las próximas 5 preguntas se refieren a las relaciones sexuales.',
    items: [
      { numero: 1, texto: '¿Alguna vez has tenido relaciones sexuales?', opciones: ['Sí', 'No'] },
      {
        numero: 2,
        texto: '¿Qué edad tenías cuando tuviste relaciones sexuales por primera vez?',
        opciones: ['Nunca he tenido relaciones sexuales', '11 años o menos', '12 años', '13 años', '14 años', '15 años', '16 años o más'],
      },
      {
        numero: 3,
        texto: 'Durante tu vida, ¿con cuántas personas has tenido relaciones sexuales?',
        opciones: ['Nunca he tenido relaciones sexuales', '1 persona', '2 personas', '3 personas', '4 personas', '5 personas', '6 o más personas'],
      },
      {
        numero: 4,
        texto: 'La última vez que tuviste relaciones sexuales, ¿usaste tú o tu pareja un condón (también conocido como "forro" o "gorrito")?',
        opciones: ['Nunca he tenido relaciones sexuales', 'Sí', 'No'],
      },
      {
        numero: 5,
        texto: 'La última vez que tuviste relaciones sexuales, ¿usaste tú o tu pareja algún otro método de control de natalidad, como la retirada, el método del ritmo, las pastillas anticonceptivas o cualquier otro método?',
        opciones: ['Nunca he tenido relaciones sexuales', 'Sí', 'No', 'No sé'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre el Consumo de Tabaco',
    intro: 'Las próximas 6 preguntas se refieren al consumo de cigarrillos y otro tipo de tabaco (por ejemplo, tabaco de mascar o cigarros de hoja).',
    items: [
      {
        numero: 1,
        texto: '¿Qué edad tenías cuando probaste un cigarrillo por primera vez?',
        opciones: ['Nunca he probado cigarrillos', '7 años de edad o menos', '8 ó 9 años', '10 u 11 años', '12 ó 13 años', '14 ó 15 años', '16 años o más'],
      },
      {
        numero: 2,
        texto: 'Durante los últimos 30 días, ¿cuántos días fumaste cigarrillos?',
        opciones: ['0 días', '1 ó 2 días', '3 a 5 días', '6 a 9 días', '10 a 19 días', '20 a 29 días', 'Los 30 días'],
      },
      {
        numero: 3,
        texto: 'Durante los últimos 30 días, ¿cuántos días usaste otra forma de tabaco, como tabaco de mascar o cigarros de hoja?',
        opciones: ['0 días', '1 ó 2 días', '3 a 5 días', '6 a 9 días', '10 a 19 días', '20 a 29 días', 'Los 30 días'],
      },
      {
        numero: 4,
        texto: 'Durante los últimos 12 meses, ¿alguna vez has intentado dejar de fumar cigarrillos?',
        opciones: ['Nunca he fumado cigarrillos', 'No he fumado cigarrillos durante los últimos 12 meses', 'Sí', 'No'],
      },
      {
        numero: 5,
        texto: 'Durante los últimos 7 días, ¿cuántos días han fumado otras personas en tu presencia?',
        opciones: ['0 días', '1 ó 2 días', '3 ó 4 días', '5 ó 6 días', 'Los 7 días'],
      },
      {
        numero: 6,
        texto: '¿Cuál de tus padres o cuidadores usa alguna forma de tabaco?',
        opciones: ['Ninguno', 'Mi padre o mi cuidador', 'Mi madre o mi cuidadora', 'Ambos', 'No sé'],
      },
    ],
  },
  {
    titulo: 'Módulo sobre Violencia y Lesiones No Intencionales',
    intro: 'La siguiente pregunta se refiere a agresiones físicas. Se produce una agresión física cuando una o varias personas golpean a alguien, o cuando lo hieren con un arma (como un palo, una piedra, un cuchillo o un arma de fuego). No hay agresión física cuando dos estudiantes de fuerza similar deciden pelear entre ellos.',
    items: [
      {
        numero: 1,
        texto: 'Durante los últimos 12 meses, ¿cuántas veces has sido víctima de una agresión física?',
        opciones: ['Ninguna', '1 vez', '2 ó 3 veces', '4 ó 5 veces', '6 ó 7 veces', '8 ó 9 veces', '10 u 11 veces', '12 o más veces'],
      },
      {
        numero: 2,
        texto: 'Durante los últimos 12 meses, ¿cuántas veces participaste en una pelea física?',
        notaPrevia: 'La próxima pregunta se refiere a riñas o peleas físicas entre estudiantes de fuerza similar.',
        opciones: ['Ninguna', '1 vez', '2 ó 3 veces', '4 ó 5 veces', '6 ó 7 veces', '8 ó 9 veces', '10 u 11 veces', '12 o más veces'],
      },
      {
        numero: 3,
        texto: 'En los últimos 12 meses, ¿cuántas veces tuviste una lesión seria?',
        notaPrevia: 'Las siguientes 3 preguntas se refieren a lesiones serias que hayas sufrido. Una lesión es seria cuando te hace perder al menos un día completo de actividades normales (como la escuela, deportes o el trabajo) o requiere atención de un médico o enfermera.',
        opciones: ['Ninguna', '1 vez', '2 ó 3 veces', '4 ó 5 veces', '6 ó 7 veces', '8 ó 9 veces', '10 u 11 veces', '12 o más veces'],
      },
      {
        numero: 4,
        texto: 'Durante los últimos 12 meses, ¿cuál fue la lesión más seria que tuviste?',
        opciones: ['No tuve ninguna lesión seria en los últimos 12 meses', 'Tuve un hueso roto o una articulación dislocada', 'Recibí un corte, una punzada o puñalada', 'Sufrí un golpe u otra lesión en la cabeza o el cuello, me desmayé o no podía respirar', 'Recibí una herida con arma de fuego', 'Sufrí una quemadura grave', 'Perdí todo o parte de un pie, pierna, mano o brazo', 'Me sucedió otra cosa'],
      },
      {
        numero: 5,
        texto: 'Durante los últimos 12 meses, ¿cuál fue la causa principal de la lesión más seria que sufriste?',
        opciones: ['No sufrí ninguna lesión seria durante los últimos 12 meses', 'Tuve un accidente automovilístico o me atropelló un vehículo a motor', 'Me caí', 'Algo me cayó encima o me golpeó', 'Estaba peleando con alguien', 'Fui agredido/a, asaltado/a o abusado/a por alguien', 'Estuve en un incendio o muy cerca de una llama o algo caliente', 'Algo distinto causó mi lesión'],
      },
      {
        numero: 6,
        texto: 'Durante los últimos 30 días, ¿cuántos días fuiste intimidado/a?',
        notaPrevia: 'Las próximas 2 preguntas se refieren a la intimidación (bullying). La intimidación ocurre cuando un estudiante o grupo de estudiantes dice o hace algo malo o desagradable a otro estudiante, lo excluye a propósito o se burla de él repetidamente. No existe intimidación cuando dos estudiantes de fuerza similar discuten o pelean, o cuando bromean de manera amistosa.',
        opciones: ['0 días', '1 ó 2 días', '3 a 5 días', '6 a 9 días', '10 a 19 días', '20 a 29 días', 'Los 30 días'],
      },
      {
        numero: 7,
        texto: 'Durante los últimos 30 días, ¿en qué forma te intimidaron con más frecuencia?',
        opciones: ['No fui intimidado/a en los últimos 30 días', 'Fui golpeado/a, pateado/a, empujado/a o encerrado/a', 'Se burlaron de mí debido a mi raza, origen o color de piel', 'Se burlaron de mí debido a mi religión', 'Se burlaron de mí con chistes, comentarios o gestos de índole sexual', 'Me excluyeron de las actividades a propósito o me ignoraron', 'Se burlaron de mí debido al aspecto de mi cuerpo o mi cara', 'Fui intimidado/a de otra manera'],
      },
    ],
  },
  {
    titulo: 'Módulo Básico Opcional (VIH/SIDA) — para contextos donde no se aplican preguntas sobre comportamiento sexual',
    intro: 'Las siguientes 4 preguntas se refieren a la infección por VIH o SIDA.',
    items: [
      { numero: 1, texto: '¿Has oído alguna vez hablar de la infección por VIH o de una enfermedad llamada SIDA?', opciones: ['Sí', 'No'] },
      { numero: 2, texto: 'En este año escolar, ¿te han enseñado en alguna de tus clases sobre la infección por VIH o el SIDA?', opciones: ['Sí', 'No', 'No sé'] },
      { numero: 3, texto: 'En este año escolar, ¿te han enseñado en alguna de tus clases cómo evitar la infección por VIH o el SIDA?', opciones: ['Sí', 'No', 'No sé'] },
      { numero: 4, texto: '¿Has hablado alguna vez con tus padres o cuidadores sobre la infección por VIH o el SIDA?', opciones: ['Sí', 'No'] },
    ],
  },
];

// Forma ya lista para <VistaInstrumentoSoloLectura />.
export const INSTRUMENTO_GSHS = {
  titulo: 'Encuesta Mundial de Salud a Escolares (GSHS)',
  subtitulo:
    'Adaptación de términos y ejemplos para el Estado Plurinacional de Bolivia. Datos sociodemográficos de referencia — no genera un diagnóstico ni un puntaje único.',
  tipoRespuesta: 'opciones',
  secciones: MODULOS.map(({ titulo, intro, items }) => ({ titulo, intro, items })),
};