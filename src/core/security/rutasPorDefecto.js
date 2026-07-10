// Fuente única de verdad, usada por
// RutaProtegida.jsx (redirige a un usuario a SU panel cuando su rol no
// coincide con el requerido) y RutaPublica.jsx (redirige a un usuario ya
// logueado lejos de las pantallas públicas de auth).
export const RUTA_POR_DEFECTO = {
  psicologo: '/dashboard',
  superadmin: '/panel-maestro',
  paciente: '/encuesta',
};