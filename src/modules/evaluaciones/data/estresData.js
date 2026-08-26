// Instrumento: Escala de Estrés Percibido (PSS-14 — Perceived Stress Scale).
//
// Migrado desde el Observatorio de Salud Mental (SCRUM-54). 14 ítems que se
// responden sobre una escala de frecuencia 0-4 referida al último mes.
// INSTRUMENTO_ESTRES (al final del archivo) es la forma que consume
// FormularioInstrumento.jsx — usa tipoRespuesta 'opciones', igual que GSHS,
// así que no hizo falta ningún componente de UI nuevo.
//
// El Observatorio original solo mostraba los números sueltos (0,1,2,3,4)
// como etiqueta de cada opción. Acá se les agregó el ancla de texto oficial
// de la escala (0=Nunca ... 4=Muy a menudo) para que sea consistente con el
// resto de la app — decisión tomada en esta sesión, confirmable con el
// responsable clínico si se prefiere dejarlos como números puros.
//
// El cálculo del resultado ocurre del lado de la base de datos (trigger
// `calcular_resultado_instrumento`), nunca acá ni en el cliente — mismo
// criterio que Clima de Aula y GSHS. La regla de puntuación que usa ese
// trigger es la que ya traía el Observatorio (ver script.js del cliente),
// NO un baremo estándar reinventado en esta sesión:
//   Ítems de puntuación directa (valor tal cual): 1, 2, 3, 8, 11, 12, 14.
//   Ítems de puntuación invertida (4 - valor, por ser enunciados en
//   sentido positivo): 4, 5, 6, 7, 9, 10, 13.
//   Puntaje total posible: 0-56.
//   Categorías: 0-13 Nivel bajo · 14-26 Nivel medio · 27-40 Nivel alto ·
//   41-56 Nivel muy alto.

const ITEMS = [
  { numero: 1, texto: 'En el último mes, ¿con qué frecuencia ha estado afectado por algo que ha ocurrido inesperadamente?' },
  { numero: 2, texto: 'En el último mes, ¿con qué frecuencia se ha sentido incapaz de controlar las cosas importantes en su vida?' },
  { numero: 3, texto: 'En el último mes, ¿con qué frecuencia se ha sentido nervioso o estresado?' },
  { numero: 4, texto: 'En el último mes, ¿con qué frecuencia ha manejado con éxito los pequeños problemas irritantes de la vida?' },
  { numero: 5, texto: 'En el último mes, ¿con qué frecuencia ha sentido que ha afrontado efectivamente los cambios importantes que han estado ocurriendo en su vida?' },
  { numero: 6, texto: 'En el último mes, ¿con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?' },
  { numero: 7, texto: 'En el último mes, ¿con qué frecuencia ha sentido que las cosas le van bien?' },
  { numero: 8, texto: 'En el último mes, ¿con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?' },
  { numero: 9, texto: 'En el último mes, ¿con qué frecuencia ha podido controlar las dificultades de su vida?' },
  { numero: 10, texto: 'En el último mes, ¿con qué frecuencia se ha sentido que tenía todo bajo control?' },
  { numero: 11, texto: 'En el último mes, ¿con qué frecuencia ha estado enfadado porque las cosas que le han ocurrido estaban fuera de su control?' },
  { numero: 12, texto: 'En el último mes, ¿con qué frecuencia ha pensado sobre las cosas que le quedan por hacer?' },
  { numero: 13, texto: 'En el último mes, ¿con qué frecuencia ha podido controlar la forma de pasar el tiempo?' },
  { numero: 14, texto: 'En el último mes, ¿con qué frecuencia ha sentido que las dificultades se acumulan tanto que no puede superarlas?' },
];

const OPCIONES_FRECUENCIA = ['0 - Nunca', '1 - Casi nunca', '2 - De vez en cuando', '3 - A menudo', '4 - Muy a menudo'];

export const INSTRUMENTO_ESTRES = {
  titulo: 'Escala de Estrés Percibido (PSS-14)',
  subtitulo:
    'Preguntas sobre tus sentimientos y pensamientos durante el último mes. Indica con qué frecuencia se aplica cada situación.',
  tipoRespuesta: 'opciones',
  secciones: [
    {
      titulo: 'Escala de Estrés Percibido (PSS-14)',
      intro: 'En cada caso, indica con qué frecuencia te has sentido o has pensado así durante el último mes.',
      items: ITEMS.map((item) => ({ ...item, opciones: OPCIONES_FRECUENCIA })),
    },
  ],
};