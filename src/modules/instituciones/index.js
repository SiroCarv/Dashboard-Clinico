// API pública del módulo `instituciones`. Solo expone la página completa
// (PanelMaestro), no sus piezas internas — ningún otro módulo necesita
// componer sus propias vistas con InstitucionList, AsignacionPsicologos,
// etc.
export { default as PanelMaestro } from './pages/PanelMaestro';
