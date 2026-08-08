// Imagen de fondo institucional, compartida por toda la plataforma
// (Login, Registro, Encuesta, Dashboard, Panel Maestro...).
//
// Vive en `shared/` porque no es exclusiva de un módulo: varios dominios
// distintos (autenticacion, evaluaciones, dashboard_clinico,
// instituciones) la necesitan, y la regla del proyecto prohíbe que un
// módulo importe un asset directamente de otro — cualquier cosa
// genuinamente compartida entre módulos va acá.
import fondo from './fondo-plataforma.webp';
export const FONDO_PLATAFORMA = fondo;
