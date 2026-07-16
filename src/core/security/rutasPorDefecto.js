// Fuente única de verdad, usada por
// RutaProtegida.jsx (redirige a un usuario a SU panel cuando su rol no
// coincide con el requerido), RutaPublica.jsx (redirige a un usuario ya
// logueado lejos de las pantallas públicas de auth) y Login.jsx (decide
// a dónde navegar justo después de autenticar). Los tres deben usar este
// mismo mapa: si Login.jsx mantuviera su propio if/else de roles, un rol
// nulo o desconocido podía terminar cayendo silenciosamente en la vista
// de paciente en vez de mostrar un error (bug real, corregido al unificar
// la fuente de verdad).
export const RUTA_POR_DEFECTO = {
  psicologo: '/dashboard',
  superadmin: '/panel-maestro',
  paciente: '/encuesta',
};