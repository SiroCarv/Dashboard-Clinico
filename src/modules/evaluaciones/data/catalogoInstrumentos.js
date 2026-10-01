// Definición de cada instrumento, indexada por `tipo_instrumento` (el
// mismo valor que se guarda en `evaluaciones_instrumento`). Sirve para
// volver a buscar el enunciado de una pregunta a partir de lo que guarda
// la base (solo módulo + número + valor) — hoy lo usa el Informe
// Consolidado del psicólogo, vía `evaluaciones/index.js`.
import { INSTRUMENTO_CLIMA_AULA } from './climaAulaData';
import { INSTRUMENTO_GSHS } from './gshsData';
import { INSTRUMENTO_ESTRES } from './estresData';
import { INSTRUMENTO_ANSIEDAD } from './ansiedadData';
import { INSTRUMENTO_DEPRESION } from './depresionData';
import { INSTRUMENTO_APGAR_FAMILIAR } from './apgarFamiliarData';
import { INSTRUMENTO_RIESGO_SUICIDA } from './riesgoSuicidaData';
import { INSTRUMENTO_BULLYING } from './bullyingData';

export const INSTRUMENTOS_POR_TIPO = {
  CLIMA_AULA: INSTRUMENTO_CLIMA_AULA,
  GSHS: INSTRUMENTO_GSHS,
  ESTRES: INSTRUMENTO_ESTRES,
  ANSIEDAD: INSTRUMENTO_ANSIEDAD,
  DEPRESION: INSTRUMENTO_DEPRESION,
  APGAR_FAMILIAR: INSTRUMENTO_APGAR_FAMILIAR,
  RIESGO_SUICIDA: INSTRUMENTO_RIESGO_SUICIDA,
  BULLYING: INSTRUMENTO_BULLYING,
};
