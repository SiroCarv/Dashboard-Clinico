// Regla de contraseña segura, unificada para TODA la plataforma
// (Registro de estudiante, Registro de docente, Alta de psicólogo por
// superadmin — cualquier pantalla que cree una cuenta con contraseña).
//
// Criterio: longitud mínima de 8 caracteres + los 4 tipos de carácter
// (mayúscula, minúscula, número, símbolo), siguiendo las recomendaciones
// de Argentina.gob.ar y la OEA sobre contraseñas seguras.
//
// Es lógica pura, sin dependencias de Supabase ni de ningún módulo de
// negocio (a diferencia de `esPasswordFiltrada`, que sí llama a un
// servicio externo y por eso vive dentro de `autenticacion`). Por eso
// esta validación vive en `shared/` en vez de duplicarse en cada módulo:
// la usan `autenticacion` (Registro, RegistroDocente) y `psicologos`
// (PsicologoModal), y no varía entre ellos — no es un caso como
// curso/turno, donde cada módulo sí necesita su propia lista.
export const LONGITUD_MINIMA_PASSWORD = 8;

const TIENE_MAYUSCULA = /[A-Z]/;
const TIENE_MINUSCULA = /[a-z]/;
const TIENE_NUMERO = /[0-9]/;
// Símbolo/carácter especial: cualquier cosa que no sea letra, número o
// espacio en blanco (cubre $, #, !, ?, @, _, y cualquier otro símbolo).
const TIENE_ESPECIAL = /[^A-Za-z0-9\s]/;

export function validarPasswordSegura(password) {
  const valor = password || '';

  const requisitos = {
    longitud: valor.length >= LONGITUD_MINIMA_PASSWORD,
    mayuscula: TIENE_MAYUSCULA.test(valor),
    minuscula: TIENE_MINUSCULA.test(valor),
    numero: TIENE_NUMERO.test(valor),
    especial: TIENE_ESPECIAL.test(valor),
  };

  const esValida = Object.values(requisitos).every(Boolean);

  return { requisitos, esValida };
}