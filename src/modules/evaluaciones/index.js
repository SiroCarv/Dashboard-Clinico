// API pública del módulo `evaluaciones`. Otros módulos (hoy,
// dashboard_clinico para el Informe Consolidado) solo pueden importar lo
// que se exporta acá — nunca una ruta interna como
// '../../evaluaciones/services/evaluacionesInstrumentoService'.
export { NIVELES_CLIMA_AULA } from './data/climaAulaData';

// Definición de TODOS los instrumentos por tipo, para que el Informe
// Consolidado pueda mostrar el enunciado real de cada pregunta.
export { INSTRUMENTOS_POR_TIPO } from './data/catalogoInstrumentos';

// Consumido también por dashboard_clinico (Informe Consolidado,
// SCRUM-31) para leer los envíos de un paciente — mismo patrón cruzado
// de módulos que ya usa `pacientesService` desde `usuarios`.
export { evaluacionesInstrumentoService } from './services/evaluacionesInstrumentoService';

// Habilitación de formularios por institución (pestaña "Formularios" del
// psicólogo en dashboard_clinico/pages/Dashboard.jsx).
export { default as PanelHabilitacionFormularios } from './components/PanelHabilitacionFormularios';