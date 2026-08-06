// Imagen de fondo institucional, compartida por toda la plataforma.
//
// Vivía en `modules/autenticacion/data/fondoAuth.js` (nombre y ubicación
// heredados de cuando solo las pantallas de login/registro la usaban).
// Se movió acá porque dejó de ser exclusiva de un módulo: `evaluaciones`
// (Encuesta), `dashboard_clinico` (Dashboard) e `instituciones`
// (PanelMaestro) también la necesitan, y la regla del proyecto prohíbe
// que un módulo importe un asset directamente de otro — cualquier cosa
// genuinamente compartida entre módulos va en `shared/`.
import fondo from './fondo-plataforma.jpg';
export const FONDO_PLATAFORMA = fondo;