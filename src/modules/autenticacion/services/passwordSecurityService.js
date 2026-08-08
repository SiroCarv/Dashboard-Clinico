// Verifica contraseñas nuevas contra la base de datos pública de
// contraseñas filtradas de HaveIBeenPwned, como alternativa a la
// "Leaked Password Protection" nativa de Supabase (requiere plan Pro;
// el proyecto está en plan Free — ver Security Advisor, agosto 2026).
//
// Usa el modelo de k-anonimato de HaveIBeenPwned: la contraseña nunca
// sale del navegador. Se calcula su hash SHA-1 localmente (Web Crypto
// API) y solo se envían los primeros 5 caracteres del hash a la API
// pública; HaveIBeenPwned responde con todos los sufijos que comparten
// ese prefijo (sin saber cuál buscamos) y la comparación final se hace
// acá mismo, comparando el sufijo restante.
//
// LIMITACIÓN A TENER PRESENTE: esta verificación corre solo del lado
// del cliente, dentro del flujo normal de esta app (alta de cuenta y
// cambio/recuperación de contraseña). No es equivalente a la protección
// nativa de Supabase: alguien que llame a la API de Supabase
// directamente, sin pasar por esta app, no pasa por este control. La
// solución completa sigue siendo el upgrade a plan Pro + activar el
// toggle nativo, que corre del lado del servidor sin excepción — queda
// documentado como pendiente en el Advisor de seguridad.
export async function esPasswordFiltrada(password) {
  try {
    const bytes = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', bytes);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const prefijo = hashHex.slice(0, 5);
    const sufijoBuscado = hashHex.slice(5);

    const respuesta = await fetch(`https://api.pwnedpasswords.com/range/${prefijo}`);

    if (!respuesta.ok) {
      // Si HaveIBeenPwned no responde, no bloqueamos el registro por un
      // servicio externo caído: este chequeo es preventivo, no la única
      // barrera de seguridad de la cuenta.
      console.warn('No se pudo verificar la contraseña contra HaveIBeenPwned (servicio no disponible).');
      return false;
    }

    const cuerpo = await respuesta.text();
    return cuerpo
      .split('\n')
      .some((linea) => linea.split(':')[0].trim() === sufijoBuscado);
  } catch (err) {
    console.warn('Error al verificar contraseña filtrada:', err.message);
    return false;
  }
}