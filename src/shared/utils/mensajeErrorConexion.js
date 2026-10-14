// Utilidad compartida para distinguir una falla de CONEXIÓN (la petición
// nunca llegó al servidor) de un error "de negocio" (el servidor respondió
// y dijo que algo está mal: carnet duplicado, PIN incorrecto, etc.).
//
// Vive en `shared/` porque la necesitan más de un módulo (autenticacion y
// personas-particulares) y la regla del proyecto prohíbe que un módulo
// importe directamente de otro.
//
// Por qué existe: cuando el navegador no logra comunicarse con Supabase
// (firewall o proxy de la red, extensión del navegador, DNS, VPN, caída de
// internet), la librería devuelve el texto técnico "Failed to fetch". Antes
// las pantallas de registro/login mostraban ese texto tal cual, y la
// persona (en un Centro de Salud o un colegio) reintentaba durante minutos
// sin saber que el problema era su red y no sus datos.
//
// Los textos de la librería de Supabase varían según el cliente que falla:
//   - Auth (signUp, signInWithPassword): error con name
//     'AuthRetryableFetchError' y message 'Failed to fetch'.
//   - Base de datos (from(...), rpc(...)): message 'TypeError: Failed to fetch'.
//   - Edge Functions (functions.invoke): name 'FunctionsFetchError'.
// Además cada navegador usa su propio texto para la misma falla
// (Chrome/Edge: 'Failed to fetch', Firefox: 'NetworkError when attempting
// to fetch resource', Safari: 'Load failed').
export const MENSAJE_ERROR_CONEXION =
  'No se pudo conectar con el servidor. Revisa tu conexión a internet o prueba desde otra red (por ejemplo, con datos del celular) e intenta nuevamente.';

const NOMBRES_ERROR_CONEXION = ['AuthRetryableFetchError', 'FunctionsFetchError'];

const FRAGMENTOS_ERROR_CONEXION = [
  'failed to fetch',
  'networkerror',
  'network request failed',
  'load failed',
  'failed to send a request',
];

export function esErrorDeConexion(err) {
  if (!err) return false;
  if (NOMBRES_ERROR_CONEXION.includes(err.name)) return true;

  const texto = String(err.message ?? '').toLowerCase();
  return FRAGMENTOS_ERROR_CONEXION.some((fragmento) => texto.includes(fragmento));
}

/**
 * Devuelve el texto que debe verse en pantalla para un error capturado:
 * el mensaje de conexión si fue una falla de red, o el mensaje propio del
 * error (ya redactado para la persona, ej. "Este carnet de identidad ya
 * está registrado.") si lo tiene, o el mensaje por defecto indicado.
 */
export function mensajeDeError(err, mensajePorDefecto) {
  if (esErrorDeConexion(err)) return MENSAJE_ERROR_CONEXION;
  return err?.message || mensajePorDefecto;
}