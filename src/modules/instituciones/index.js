// API pública del módulo `instituciones`. Expone la página completa
// (PanelMaestro) para quien necesite el panel entero, y además
// `institucionesService` para lecturas puntuales desde otros módulos —
// por ejemplo, `dashboard_clinico` lo usa para poblar el catálogo
// completo de instituciones en sus filtros (Panel Consolidado,
// Resultados GSHS), sin depender de qué instituciones ya tienen
// resultados cargados. Ningún otro módulo debe importar
// InstitucionList, AsignacionPsicologos, etc. directamente — solo estos
// puntos de entrada.
//
// TIPOS_INSTITUCION / TIPO_POR_DEFECTO / obtenerLabelTipo (agregado para
// el filtro "Tipo de Institución" del Panel Consolidado del
// superadmin, dashboard_clinico): antes solo los usaba este módulo
// internamente (InstitucionList/InstitucionModal). Se re-exportan tal
// cual desde data/tiposInstitucion.js -- única fuente de verdad -- para
// que otro módulo nunca tenga que duplicar la lista de tipos ni importar
// esa ruta interna directamente.
export { default as PanelMaestro } from './pages/PanelMaestro';
export { institucionesService } from './services/institucionesService';
export { TIPOS_INSTITUCION, TIPO_POR_DEFECTO, obtenerLabelTipo } from './data/tiposInstitucion';