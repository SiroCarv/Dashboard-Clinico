// Convención compartida para "borradores" guardados en localStorage:
// trabajo en curso del usuario (ej. respuestas de un formulario todavía
// no enviado) que NO debe borrarse en un cierre de sesión, a diferencia
// de tokens, cookies o cachés (que sí se borran por completo).
//
// Vive en shared/ y no dentro de ningún módulo porque tanto quien GUARDA
// un borrador (hoy, evaluaciones) como quien LIMPIA la sesión
// (autenticacion) necesitan reconocer la misma convención de clave, sin
// que un módulo importe directamente al otro — la regla del proyecto es
// que los módulos solo se comunican a través de shared/core o de su
// propio index.js público.
const PREFIJO_BORRADOR = 'borrador::';

// Arma una clave de borrador a partir de sus partes (ej. claveBorrador('encuesta', idPaciente, tipo)).
export function claveBorrador(...partes) {
  return `${PREFIJO_BORRADOR}${partes.join('::')}`;
}

function esClaveDeBorrador(clave) {
  return clave.startsWith(PREFIJO_BORRADOR);
}

// La usa el cierre de sesión (autenticacion/hooks/useCerrarSesion.js) en
// vez de un localStorage.clear() directo, para no perder trabajo en
// curso guardado localmente por otros módulos.
export function limpiarLocalStoragePreservandoBorradores() {
  Object.keys(localStorage)
    .filter((clave) => !esClaveDeBorrador(clave))
    .forEach((clave) => localStorage.removeItem(clave));
}