// Catálogo único de los formularios que responde un estudiante. Lo usa la
// pestaña "Formularios" del psicólogo (habilitación) para listarlos en un
// orden fijo con su nombre visible. El valor `tipo` es el mismo que se
// guarda en `evaluaciones_instrumento.tipo_instrumento` y en
// `formularios_habilitados.tipo_instrumento`.
export const CATALOGO_FORMULARIOS_ESTUDIANTE = [
  { tipo: 'CLIMA_AULA', etiqueta: 'Clima de Aula' },
  { tipo: 'GSHS', etiqueta: 'GSHS' },
  { tipo: 'ESTRES', etiqueta: 'Estrés' },
  { tipo: 'ANSIEDAD', etiqueta: 'Ansiedad' },
  { tipo: 'DEPRESION', etiqueta: 'Depresión' },
  { tipo: 'APGAR_FAMILIAR', etiqueta: 'Cuidado Primario De Salud Familiar' },
  { tipo: 'RIESGO_SUICIDA', etiqueta: 'Riesgo Suicida' },
  { tipo: 'BULLYING', etiqueta: 'Bullying' },
];
