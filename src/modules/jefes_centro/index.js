// API pública del módulo `jefes_centro` (cuentas de Jefe/a de Centro de
// Salud, gestionadas por el superadmin). Consumido hoy por PanelMaestro
// (módulo `instituciones`) para mostrar la pestaña "Jefes de Centro" —
// nunca importa las rutas internas. El panel que usa el propio jefe/a
// para supervisar su centro NO vive acá: está en `dashboard_clinico`,
// junto al resto de pantallas de monitoreo clínico.
export { GestionJefesCentro } from './components/GestionJefesCentro';
