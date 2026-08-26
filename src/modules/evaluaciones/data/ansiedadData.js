// Instrumento: Inventario de Ansiedad de Beck (BAI — Beck Anxiety Inventory).
//
// Migrado desde el Observatorio de Salud Mental (SCRUM-54). 21 síntomas que
// se responden sobre cuánto han molestado en la última semana, escala 0-3.
// INSTRUMENTO_ANSIEDAD (al final del archivo) es la forma que consume
// FormularioInstrumento.jsx — tipoRespuesta 'opciones', igual que estrés.js.
//
// Mismo criterio que en estresData.js: el Observatorio original solo
// mostraba números sueltos (0,1,2,3); acá se agregó el ancla de texto
// oficial de la escala (0=Nada ... 3=Severo).
//
// El cálculo ocurre del lado de la base de datos (trigger
// `calcular_resultado_instrumento`). Puntuación: suma directa de los 21
// ítems (sin ítems invertidos, a diferencia del PSS-14). Puntaje total
// posible: 0-63. Categorías, tal como las traía el Observatorio (ver
// script.js del cliente — no son los cortes "oficiales" más citados de
// Beck, son los que el cliente ya usa en producción):
//   0-7 No presenta ansiedad · 8-18 Ansiedad leve · 19-29 Ansiedad
//   moderada · 30-63 Ansiedad grave.

const ITEMS = [
  { numero: 1, texto: 'Torpe o entumecido' },
  { numero: 2, texto: 'Acalorado' },
  { numero: 3, texto: 'Con temblor en las piernas' },
  { numero: 4, texto: 'Incapaz de relajarse' },
  { numero: 5, texto: 'Con temor a que ocurra lo peor' },
  { numero: 6, texto: 'Mareado o que se le va la cabeza' },
  { numero: 7, texto: 'Con latidos del corazón fuerte y acelerado' },
  { numero: 8, texto: 'Inestable' },
  { numero: 9, texto: 'Atemorizado y asustado' },
  { numero: 10, texto: 'Nervioso' },
  { numero: 11, texto: 'Con sensación de bloqueo' },
  { numero: 12, texto: 'Con temblores en las manos' },
  { numero: 13, texto: 'Inquieto, inseguro' },
  { numero: 14, texto: 'Con miedo a perder el control' },
  { numero: 15, texto: 'Con sensación de ahogo' },
  { numero: 16, texto: 'Con temor a morir' },
  { numero: 17, texto: 'Con miedo' },
  { numero: 18, texto: 'Con problemas digestivos' },
  { numero: 19, texto: 'Con desvanecimiento' },
  { numero: 20, texto: 'Con rubor facial' },
  { numero: 21, texto: 'Con sudores fríos o calientes' },
];

const OPCIONES_INTENSIDAD = ['0 - Nada', '1 - Leve', '2 - Moderado', '3 - Severo'];

export const INSTRUMENTO_ANSIEDAD = {
  titulo: 'Inventario de Ansiedad de Beck (BAI)',
  subtitulo:
    'Lista de síntomas comunes de ansiedad. Indica cuánto te ha molestado cada uno durante la última semana, incluyendo hoy.',
  tipoRespuesta: 'opciones',
  secciones: [
    {
      titulo: 'Inventario de Ansiedad de Beck (BAI)',
      intro: 'Lee cada síntoma con atención e indica cuánto te ha molestado en la última semana.',
      items: ITEMS.map((item) => ({ ...item, opciones: OPCIONES_INTENSIDAD })),
    },
  ],
};