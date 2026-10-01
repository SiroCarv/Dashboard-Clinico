// Acceso de estudiantes con "código de estudiante" en vez de correo.
//
// Supabase Auth exige un correo para toda cuenta, así que cada estudiante
// registrado sin correo tiene uno interno, derivado de su código
// (UNI-000123 -> uni-000123@estudiantes.plataforma.invalid). Nunca se le
// muestra ni se guarda en `usuarios.email`. Lo crea la Edge Function
// `registrar-estudiante`: el dominio de abajo debe ser IDÉNTICO al que
// usa ese archivo (supabase/functions/registrar-estudiante/index.ts).
export const DOMINIO_INTERNO_ESTUDIANTES = 'estudiantes.plataforma.invalid';

// Código de estudiante: "UNI-" + dígitos (lo asigna el servidor).
const PATRON_CODIGO_ESTUDIANTE = /^UNI-\d{1,}$/i;

export function esCodigoEstudiante(texto) {
  return PATRON_CODIGO_ESTUDIANTE.test((texto || '').trim());
}

// Devuelve el correo con el que Supabase Auth conoce a ese estudiante.
export function correoInternoDeCodigo(codigo) {
  return `${codigo.trim().toLowerCase()}@${DOMINIO_INTERNO_ESTUDIANTES}`;
}

// ¿Es el correo interno de un estudiante? Nadie debe escribirlo a mano:
// el estudiante entra con su código.
export function esCorreoInternoEstudiante(texto) {
  return (texto || '').trim().toLowerCase().endsWith(`@${DOMINIO_INTERNO_ESTUDIANTES}`);
}

// Contraseña de estudiante: política más simple que la del resto de roles
// (decisión del cliente: alumnos de secundaria, sin correo de recuperación).
export const LONGITUD_MINIMA_PASSWORD_ESTUDIANTE = 6;
