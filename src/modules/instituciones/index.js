// API pública del módulo `instituciones`. Expone la página completa
// (PanelMaestro) para quien necesite el panel entero, y además
// `institucionesService` para lecturas puntuales desde otros módulos —
// por ejemplo, `dashboard_clinico` lo usa para poblar el catálogo
// completo de instituciones en sus filtros (Panel Consolidado,
// Resultados GSHS), sin depender de qué instituciones ya tienen
// resultados cargados. Ningún otro módulo debe importar
// InstitucionList, AsignacionPsicologos, etc. directamente — solo estos
// dos puntos de entrada.
export { default as PanelMaestro } from './pages/PanelMaestro';
export { institucionesService } from './services/institucionesService';
