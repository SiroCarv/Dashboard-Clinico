// API pública del módulo `evaluaciones`. Otros módulos (hoy,
// dashboard_clinico para el Informe Consolidado) solo pueden importar lo
// que se exporta acá — nunca una ruta interna como
// '../../evaluaciones/services/evaluacionesInstrumentoService'.
export { INSTRUMENTO_CLIMA_AULA } from './data/climaAulaData';
export { INSTRUMENTO_GSHS } from './data/gshsData';

// Consumido también por dashboard_clinico (Informe Consolidado,
// SCRUM-31) para leer los envíos de un paciente — mismo patrón cruzado
// de módulos que ya usa `pacientesService` desde `usuarios`.
export { evaluacionesInstrumentoService } from './services/evaluacionesInstrumentoService';
