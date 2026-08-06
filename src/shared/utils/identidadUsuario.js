// Historia "Nueva Terminología de Usuarios" (SCRUM-32): la palabra
// "Paciente" ya no debe aparecer en ninguna pantalla. En su lugar se
// distingue entre dos identidades, según si la persona pertenece a una
// institución (colegio) o no:
//
//   - Participante: tiene institución (viene del registro de
//     estudiantes, `usuarios.institucion_id` no es NULL — visible acá
//     como `institucion` presente en el objeto ya cargado).
//   - Consultante: no tiene institución (viene del registro particular /
//     clínica universitaria), `institucion` llega null/undefined.
//
// No se toca ninguna consulta, tabla, columna ni rol de base de datos:
// esto es lógica puramente de presentación. `usuarios.rol` sigue
// guardando el valor 'paciente' — eso es un identificador interno, no
// texto en pantalla.
//
// Vive en `shared/` (no dentro de `dashboard_clinico`) porque más de un
// módulo la necesita (tabla del dashboard, informe consolidado y la
// exportación a Excel) y la regla del proyecto prohíbe que un módulo
// importe directamente de otro.
//
// IMPORTANTE — RLS: hoy ningún psicólogo puede ver a un Consultante en
// su listado. La política `usuarios_select_psicologo_pacientes` filtra
// por `institucion_id IN (instituciones del psicólogo)`, y un Consultante
// tiene `institucion_id = NULL`, que nunca coincide con esa condición.
// Este archivo ya está listo para mostrar ambas identidades juntas en
// cuanto se defina (y se implemente en RLS) qué psicólogo(s) atienden a
// los Consultantes — ítem pendiente de decisión con el cliente.

import { COLOR_MARCA } from '../theme/paletaColores';

export const ETIQUETA_PARTICIPANTE = 'Participante';
export const ETIQUETA_CONSULTANTE = 'Consultante';

/**
 * Determina la etiqueta a mostrar para la persona que respondió una
 * evaluación, a partir del objeto `paciente` (con o sin `institucion`).
 *
 * @param {{ institucion?: { nombre: string } | null } | null | undefined} persona
 * @returns {'Participante' | 'Consultante'}
 */
export function obtenerEtiquetaIdentidad(persona) {
  return persona?.institucion ? ETIQUETA_PARTICIPANTE : ETIQUETA_CONSULTANTE;
}

/**
 * Nombre a mostrar, con un fallback que respeta la etiqueta correcta en
 * vez del genérico "Paciente desconocido".
 *
 * @param {{ nombre?: string, email?: string, institucion?: object|null } | null | undefined} persona
 * @returns {string}
 */
export function obtenerNombreMostrado(persona) {
  return persona?.nombre || persona?.email || `${obtenerEtiquetaIdentidad(persona)} desconocido`;
}

/**
 * Clases de Tailwind para la etiqueta de identidad, reutilizando dos de
 * los colores de marca ya definidos en `paletaColores.js` (nunca rojo ni
 * amarillo, reservados exclusivamente para severidad clínica).
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
