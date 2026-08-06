export { INSTRUMENTO_CLIMA_AULA } from './data/climaAulaData';
export { INSTRUMENTO_GSHS } from './data/gshsData';

// Historia "Envío individual de resultados por instrumento": lo consume
// también dashboard_clinico (Informe Consolidado, SCRUM-31) para leer los
// envíos de un paciente, siguiendo el mismo patrón cruzado de módulos que
// ya usa `evaluacionesService` en `useHistorialEvaluaciones.js`.
export { evaluacionesInstrumentoService } from './services/evaluacionesInstrumentoService';