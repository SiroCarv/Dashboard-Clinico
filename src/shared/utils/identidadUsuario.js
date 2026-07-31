// Historia "Nueva Terminología de Usuarios" (SCRUM-32): la palabra
// "Paciente" ya no debe aparecer en ninguna pantalla. En su lugar se
// distingue entre dos identidades, según si la persona pertenece a una
// institución (colegio) o no:
//
//   - Participante: tiene institución (viene de "Registro de Estudiantes",
//     usuarios.institucion_id no es NULL — visible acá como `institucion`
//     presente en el join que ya trae evaluacionesService).
//   - Consultante: no tiene institución (viene de "Registro de
//     Consultantes" / clínica universitaria), `institucion` llega
//     null/undefined.
//
// No se toca ninguna consulta, tabla, columna, rol de base de datos ni
// ruta: esto es lógica puramente de presentación. `usuarios.rol` sigue
// guardando el valor 'paciente' y la ruta sigue siendo
// '/registro-particular' — eso es un identificador interno, no texto en
// pantalla, y el criterio de aceptación #6 exige que nada de eso cambie
// de comportamiento.
//
// Vive en `shared/` (no dentro de `dashboard_clinico`) porque más de un
// módulo la necesita (tabla del dashboard y detalle clínico) y la regla
// del proyecto prohíbe que un módulo importe directamente de otro.

import { COLOR_MARCA } from '../theme/paletaColores';

export const ETIQUETA_PARTICIPANTE = 'Participante';
export const ETIQUETA_CONSULTANTE = 'Consultante';

/**
 * Determina la etiqueta a mostrar para la persona que respondió una
 * evaluación, a partir del objeto `paciente` que ya trae el join de
 * `evaluacionesService` (`paciente: { nombre, email, institucion }`).
 *
 * @param {{ institucion?: { nombre: string } | null } | null | undefined} persona
 * @returns {'Participante' | 'Consultante'}
 */
export function obtenerEtiquetaIdentidad(persona) {
  return persona?.institucion ? ETIQUETA_PARTICIPANTE : ETIQUETA_CONSULTANTE;
}

/**
 * Nombre a mostrar, con fallback que respeta la etiqueta correcta en vez
 * del genérico "Paciente desconocido" (criterio de aceptación #5).
 *
 * @param {{ nombre?: string, email?: string, institucion?: object|null } | null | undefined} persona
 * @returns {string}
 */
export function obtenerNombreMostrado(persona) {
  return persona?.nombre || persona?.email || `${obtenerEtiquetaIdentidad(persona)} desconocido`;
}

/**
 * Clases de Tailwind para la etiqueta de identidad, reutilizando dos de
 * los 4 colores de marca ya definidos en `paletaColores.js` (nunca rojo
 * ni amarillo, reservados exclusivamente para severidad clínica).
 * Participante -> teal azulado, Consultante -> violeta suave.
 *
 * @param {'Participante' | 'Consultante'} etiqueta
 * @returns {string}
 */
export function obtenerEstiloEtiquetaIdentidad(etiqueta) {
  return etiqueta === ETIQUETA_PARTICIPANTE
    ? COLOR_MARCA.tealAzulado.suave
    : COLOR_MARCA.violetaSuave.suave;
}