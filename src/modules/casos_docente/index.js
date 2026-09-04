// API pública del módulo `casos_docente`. Expone la página completa del
// docente (mismo patrón que instituciones/index.js con PanelMaestro) y,
// desde el reemplazo del flujo de reportes, también el panel de lectura
// + el hook para el psicólogo -- lo consume
// dashboard_clinico/pages/Dashboard.jsx en su pestaña "Reportes",
// siempre a través de este archivo, nunca importando una ruta interna.
export { default as RegistroCasoDocente } from './pages/RegistroCasoDocente';
export { default as PanelReportesInstitucion } from './components/PanelReportesInstitucion';
export { useReportesInstitucion } from './hooks/useReportesInstitucion';