// API pública del módulo `personas-particulares`. App.jsx importa las
// páginas desde acá (nunca desde sus rutas internas) — mismo criterio
// que ya usan `autenticacion`, `evaluaciones`, `casos_docente`, etc.
export { default as RegistroPersonaParticular } from './pages/RegistroPersonaParticular';
export { default as LoginPersonaParticular } from './pages/LoginPersonaParticular';