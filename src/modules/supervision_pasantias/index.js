// API pública del módulo `supervision_pasantias` (rol Docente Supervisora,
// cuenta única, que revisa y califica el trabajo de las estudiantes en
// pasantía). Consumido por:
//   - App.jsx: las dos páginas de la propia supervisora (lista de pasantes
//     y detalle con calificación).
//   - PanelMaestro (módulo `instituciones`): la pestaña "Supervisora" donde
//     el superadmin crea/edita la cuenta y marca qué psicólogos son
//     pasantes.
// Nunca se importan rutas internas de este módulo desde fuera.
export { default as PanelSupervisora } from './pages/PanelSupervisora';
export { default as DetallePasante } from './pages/DetallePasante';
export { GestionSupervisora } from './components/GestionSupervisora';
