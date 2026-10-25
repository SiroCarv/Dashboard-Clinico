// Cuánto tiempo sin usar la plataforma tolera cada rol antes de que se le
// cierre la sesión automáticamente (ver hooks/useCierrePorInactividad.js).
//
// Por qué dos tiempos distintos: psicólogo, superadmin, docente y jefe/a de
// centro manejan información de otras personas y suelen trabajar desde
// equipos de oficina o compartidos, así que se cierra más rápido (15 min).
// Estudiante y persona particular responden los formularios desde el
// celular y a veces tardan en leer una pregunta, así que se les da más
// margen (30 min).
//
// Para cambiar un tiempo basta con editar el número de ese rol acá — no
// hay que tocar ninguna otra pantalla.
const MINUTO_MS = 60 * 1000;

export const LIMITE_INACTIVIDAD_MS = {
  psicologo: 15 * MINUTO_MS,
  superadmin: 15 * MINUTO_MS,
  docente: 15 * MINUTO_MS,
  jefe_centro: 15 * MINUTO_MS,
  paciente: 30 * MINUTO_MS,
  persona_particular: 30 * MINUTO_MS,
};

// Se usa mientras todavía no se sabe el rol (se consulta a la base de
// datos justo después de entrar) o si ese rol no está en la lista de
// arriba. Es el valor más corto a propósito: ante la duda, se protege
// más, no menos.
export const LIMITE_INACTIVIDAD_DEFECTO_MS = 15 * MINUTO_MS;

export function limiteInactividadParaRol(rol) {
  return LIMITE_INACTIVIDAD_MS[rol] ?? LIMITE_INACTIVIDAD_DEFECTO_MS;
}