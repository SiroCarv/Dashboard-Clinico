// Contenido legal de Consentimiento/Asentimiento Informado del Observatorio
// de Salud Mental (OSM) — UNIFRANZ, tomado del documento oficial entregado
// por el cliente: "Consentimiento_Asentimiento_Tamizaje_OSM_UNIFRANZ.docx"
// (Versión 1 — Julio 2026).
//
// Este archivo alimenta a DocumentoConsentimiento.jsx: cada export de
// abajo (CONSENTIMIENTO_TUTOR_MENOR, ASENTIMIENTO_MENOR,
// CONSENTIMIENTO_PROPIO_MAYOR) es el contenido completo de UNA de las 3
// variantes del documento. useConsentimiento.js decide cuál(es) mostrar
// según la edad calculada del paciente.
//
// Decisión documentada: el documento del cliente define 3 variantes, una
// por rama de edad. Los rangos de edad no eran consistentes dentro del
// propio documento (12-17 / 11-18 / 11-17 / 18 según la sección); se
// adoptó el corte 11-17 -> tutor + asentimiento propio, 18+ ->
// autoconsentimiento (ver EDAD_CORTE_AUTOCONSENTIMIENTO más abajo),
// quedando documentado acá para que quede a la vista si el cliente
// confirma un corte distinto.
//
// El contenido de "checklist" reproduce las casillas "☐" del documento
// original (sección de Autorización/Declaración): el usuario debe marcar
// TODAS antes de habilitar la decisión final. Los textos de "autorizar" y
// "noAutorizar" son las dos opciones finales en negrita del documento.

// Edad a partir de la cual una persona autoconsiente su propia
// participación (18+). Por debajo de este corte se pide consentimiento
// del tutor legal + asentimiento propio del menor.
export const EDAD_CORTE_AUTOCONSENTIMIENTO = 18;

export const TIPO_CONSENTIMIENTO = {
  TUTOR_MENOR: 'tutor_menor',
  ASENTIMIENTO_MENOR: 'asentimiento_menor',
  PROPIO_MAYOR: 'propio_mayor',
};

const CONTACTO_INVESTIGADOR =
  'MSc. James Yhon Robles Pinto — Director de la Carrera de Psicología, UNIFRANZ / Observatorio de Salud Mental. Correo: jrobles@unifranz.edu.bo · Teléfono: 591-72160914.';

export const CONSENTIMIENTO_TUTOR_MENOR = {
  tipo: TIPO_CONSENTIMIENTO.TUTOR_MENOR,
  titulo: 'Consentimiento Informado — Padre, Madre o Tutor/a Legal',
  subtitulo: 'Observatorio de Salud Mental (OSM) — UNIFRANZ · Tamizaje en Salud Mental Escolar',
  intro:
    'Su hijo/a o representado/a está siendo invitado/a a participar en la plataforma de tamizaje en salud mental escolar del Observatorio de Salud Mental (OSM) de UNIFRANZ. Antes de decidir, le pedimos leer con atención este documento, que explica en qué consiste el tamizaje, sus beneficios, sus riesgos y sus derechos como representante legal del estudiante.',
  secciones: [
    {
      titulo: '¿Por qué se realiza este tamizaje?',
      parrafos: [
        'En la adolescencia pueden aparecer con frecuencia dificultades emocionales como ansiedad, depresión, estrés, riesgo de conducta suicida y situaciones de acoso escolar (bullying), muchas veces sin que la familia o la institución educativa lo perciban a tiempo. El OSM-UNIFRANZ desarrolló esta plataforma para identificar tempranamente estas dificultades y orientar oportunamente a los estudiantes, familias e instituciones hacia el apoyo profesional que corresponda.',
      ],
    },
    {
      titulo: '¿Cuál es el objetivo del tamizaje?',
      parrafos: [
        'Evaluar la prevalencia de síntomas de ansiedad, depresión, estrés, riesgo de conducta suicida y experiencias de acoso escolar en estudiantes, con el fin de generar información útil para la detección temprana, la referencia oportuna a servicios de salud mental y el diseño de estrategias de prevención en el ámbito escolar.',
      ],
    },
    {
      titulo: '¿En qué consiste la participación de mi hijo/a?',
      parrafos: [
        'La participación consiste en completar, en un solo momento y dentro del horario escolar (o el espacio designado por la institución), los instrumentos de tamizaje de forma individual y confidencial. El tiempo estimado de aplicación del paquete completo es de aproximadamente 30 a 45 minutos. Las respuestas se registran en la plataforma digital del OSM-UNIFRANZ bajo un código de identificación, con acceso restringido al equipo autorizado.',
      ],
    },
    {
      titulo: '¿Qué sucede si los resultados indican un riesgo para la salud mental de mi hijo/a?',
      parrafos: [
        'El bienestar del estudiante tiene prioridad sobre cualquier otro objetivo del tamizaje. Si las respuestas indican un riesgo significativo — en particular, riesgo de conducta suicida — se activará de inmediato el protocolo institucional de contención y referencia: se le contactará a usted como padre, madre o tutor/a legal, se informará al departamento de orientación o bienestar del centro educativo, y se brindará orientación para el acceso a atención profesional. Esta comunicación se realiza aun cuando implique romper la confidencialidad general del estudio, porque la protección de la vida y la integridad del estudiante prevalece sobre la reserva de los datos.',
      ],
    },
    {
      titulo: '¿Cuáles son las molestias o riesgos esperados?',
      parrafos: [
        'El tamizaje no implica procedimientos médicos ni riesgos físicos. Algunas preguntas — en especial las relacionadas con síntomas emocionales, riesgo de conducta suicida o experiencias de acoso escolar — podrían generar incomodidad, tristeza o recuerdos difíciles. Por ello, la aplicación se realiza en un ambiente privado, con personal capacitado disponible para contener cualquier malestar, y con la posibilidad de suspender la participación en cualquier momento.',
      ],
    },
    {
      titulo: '¿Cuáles son los beneficios de participar?',
      parrafos: [
        'No se entrega ninguna compensación económica. El beneficio principal es la posibilidad de una detección temprana de dificultades emocionales o de situaciones de acoso escolar que de otro modo podrían pasar inadvertidas, permitiendo una orientación oportuna. Los resultados agregados también contribuyen a que la institución educativa y el OSM-UNIFRANZ diseñen estrategias de prevención más pertinentes.',
      ],
    },
    {
      titulo: '¿Existe confidencialidad en el manejo de los datos?',
      parrafos: [
        'Sí. Toda la información se trata con confidencialidad y se usa exclusivamente para los fines de este tamizaje. Los datos se codifican, de manera que el nombre del estudiante no se utiliza directamente en los análisis ni en la difusión de resultados. El acceso a la información identificable está restringido al equipo autorizado y al psicólogo o responsable del centro educativo que deba intervenir ante un riesgo detectado.',
        'La única excepción a la confidencialidad es cuando exista riesgo para la vida, la salud o la integridad del estudiante: en ese caso, la información se comparte con usted mediante la institución educativa con el único fin de proteger al estudiante.',
      ],
    },
    {
      titulo: '¿Existe alguna obligación financiera?',
      parrafos: ['Participar en este tamizaje no tiene ningún costo económico para usted, para su hijo/a ni para la institución educativa.'],
    },
    {
      titulo: '¿Qué sucede si no deseo que mi hijo/a participe, o deseamos retirarnos?',
      parrafos: [
        'La participación es completamente VOLUNTARIA. Si decide no autorizar la participación, o si en cualquier momento deciden retirarse, esto no tendrá ninguna consecuencia académica, disciplinaria ni de ningún otro tipo para el estudiante ante la institución educativa.',
      ],
    },
    {
      titulo: '¿A quién puedo solicitar más información?',
      parrafos: [`Si tiene cualquier pregunta sobre este tamizaje, puede comunicarse con el investigador principal: ${CONTACTO_INVESTIGADOR}`],
    },
  ],
  checklist: [
    'He recibido y comprendido la información sobre el propósito de este tamizaje.',
    'Comprendo los instrumentos que se aplicarán a mi hijo/a y el tiempo que tomarán.',
    'Comprendo el protocolo de actuación en caso de detectarse riesgo para la salud mental de mi hijo/a.',
    'Comprendo que la participación es voluntaria y que puede retirarse en cualquier momento sin consecuencia alguna.',
    'Comprendo cómo se protegerá la confidencialidad de la información, y la única excepción a la misma.',
    'He tenido la oportunidad de hacer preguntas y he recibido respuestas satisfactorias.',
  ],
  autorizarLabel: 'AUTORIZO la participación de mi hijo/a en este tamizaje de salud mental escolar.',
  noAutorizarLabel: 'NO AUTORIZO la participación de mi hijo/a en este tamizaje de salud mental escolar.',
  certificacion:
    'Tu confirmación en pantalla certifica que has leído y comprendido este documento, que tu decisión es voluntaria, y que puedes solicitar una copia del mismo al investigador principal.',
};

export const ASENTIMIENTO_MENOR = {
  tipo: TIPO_CONSENTIMIENTO.ASENTIMIENTO_MENOR,
  titulo: 'Asentimiento Informado — Para ti',
  subtitulo: 'Observatorio de Salud Mental (OSM) — UNIFRANZ · Léelo con atención antes de decidir',
  intro:
    'El asentimiento informado es el proceso mediante el cual tú, como estudiante, comprendes y aceptas voluntariamente participar en este tamizaje de salud mental, además de la autorización que ya dio tu padre, madre o tutor/a legal. Tu opinión importa y debe ser escuchada.',
  secciones: [
    {
      titulo: '¿Qué vamos a hacer?',
      parrafos: [
        'Te vamos a pedir que respondas, tú solo/a y en privado, unos formularios sobre datos generales, tus hábitos de salud, y cómo te has sentido últimamente (ansiedad, tristeza, estrés). También hay preguntas sobre si alguna vez pensaste en hacerte daño, y sobre si has vivido o visto situaciones de acoso escolar (bullying).',
        'Esto no es un examen: no hay respuestas buenas ni malas. Solo queremos saber cómo estás realmente. Tardará entre 30 y 45 minutos aproximadamente.',
      ],
    },
    {
      titulo: '¿Cuáles son tus derechos?',
      parrafos: [
        'Puedes preguntar todo lo que no entiendas, en cualquier momento. Puedes decir "no sé" o "no quiero responder" esa pregunta, y está bien. Puedes pedir un descanso o parar cuando quieras. Puedes decidir NO participar, y eso no te traerá ningún problema en el colegio. Lo que cuentes será confidencial: tu nombre no aparecerá en los resultados.',
        'Si tus respuestas muestran que necesitas ayuda o estás en riesgo, un profesional del equipo hablará contigo y con tu familia para apoyarte — esto no es un castigo, es para cuidarte.',
      ],
    },
    {
      titulo: 'Una excepción importante',
      parrafos: [
        'Si en tus respuestas detectamos que tu vida, tu salud o tu seguridad podrían estar en riesgo — por ejemplo, si cuentas que pensaste en hacerte daño — el colegio y el equipo del OSM-UNIFRANZ no podrán guardar eso en secreto: se lo contaremos a tu papá, mamá o tutor/a, y buscaremos ayuda profesional para ti. Esto se hace porque tu seguridad es lo más importante para nosotros.',
      ],
    },
  ],
  checklist: [
    'Me explicaron con claridad qué voy a hacer en este tamizaje y lo entendí.',
    'Sé que mis respuestas son confidenciales, salvo si hay un riesgo para mi seguridad.',
    'Conozco mis derechos durante este proceso.',
    'Tuve la oportunidad de hacer preguntas y me las respondieron.',
    'Nadie me obligó a participar — lo hago porque quiero.',
  ],
  autorizarLabel: 'SÍ quiero participar en este tamizaje.',
  noAutorizarLabel: 'NO quiero participar en este tamizaje.',
  certificacion:
    'Nota: si te niegas, tu decisión se respeta de inmediato, incluso si tu padre, madre o tutor/a ya autorizó tu participación — salvo que se detecte una situación de riesgo que amerite intervención.',
};

export const CONSENTIMIENTO_PROPIO_MAYOR = {
  tipo: TIPO_CONSENTIMIENTO.PROPIO_MAYOR,
  titulo: 'Consentimiento Informado — Autorización propia (18 años)',
  subtitulo: 'Observatorio de Salud Mental (OSM) — UNIFRANZ · Tamizaje en Salud Mental Escolar',
  intro:
    'Si tienes 18 años, puedes autorizar tu propia participación en este tamizaje, sin necesidad de la firma de tus padres o tutores. Te pedimos leer con atención este documento antes de decidir.',
  secciones: [
    {
      titulo: '¿En qué consiste el tamizaje?',
      parrafos: [
        'Consiste en completar, en un solo momento, de forma individual y confidencial, los instrumentos de tamizaje sobre datos generales y antecedentes, hábitos de salud, y síntomas de ansiedad, depresión, estrés, riesgo de conducta suicida y acoso escolar. El tiempo estimado es de 30 a 45 minutos.',
      ],
    },
    {
      titulo: 'Confidencialidad y excepción por riesgo',
      parrafos: [
        'Tus respuestas serán codificadas y tratadas confidencialmente por el equipo del OSM-UNIFRANZ. La única excepción es si tus respuestas indican un riesgo significativo para tu vida, salud o integridad — en particular, riesgo de conducta suicida: en ese caso, el equipo activará el protocolo de contención y te pondrá en contacto con apoyo profesional, y podrá informar a la institución educativa con el único fin de protegerte.',
      ],
    },
    {
      titulo: 'Voluntariedad',
      parrafos: [
        'Tu participación es completamente voluntaria. Puedes decidir no participar o retirarte en cualquier momento, sin ninguna consecuencia académica ni de otro tipo. No existe ningún costo ni compensación económica asociados a tu participación.',
      ],
    },
    {
      titulo: 'Contacto',
      parrafos: [CONTACTO_INVESTIGADOR],
    },
  ],
  checklist: [
    'He leído y comprendido este documento.',
    'Comprendo que mi participación es voluntaria y puedo retirarme en cualquier momento.',
    'Comprendo la excepción a la confidencialidad en caso de riesgo para mi salud o seguridad.',
  ],
  autorizarLabel: 'SÍ autorizo mi participación en este tamizaje.',
  noAutorizarLabel: 'NO autorizo mi participación en este tamizaje.',
  certificacion:
    'Tu confirmación en pantalla certifica que has leído y comprendido este documento y que tu decisión es voluntaria.',
};
