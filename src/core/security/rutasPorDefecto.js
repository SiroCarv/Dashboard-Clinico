// Mapa único de "a dónde pertenece cada rol": psicólogo -> Dashboard,
// superadmin -> Panel Maestro, paciente -> Encuesta.
//
// Es la ÚNICA fuente de verdad para esa decisión en toda la app. La
// consumen 3 lugares con 3 propósitos distintos:
//   - RutaProtegida.jsx: si el rol del usuario no coincide con el que
//     exige la pantalla, lo manda a SU PROPIA vista por defecto (no a
//     Login) usando este mismo mapa.
//   - RutaPublica.jsx: si un usuario YA logueado entra a una pantalla
//     pública (Login, Registro...), lo saca de ahí hacia su vista por
//     defecto.
//   - Login.jsx: decide a dónde navegar justo después de un login
//     exitoso.
//
// Por qué importa que los 3 usen este mismo objeto en vez de tener su
// propio if/else de roles: si cada uno tuviera su propia lógica, un rol
// nulo, vacío o desconocido podía terminar cayendo silenciosamente en la
// vista de paciente por accidente en vez de mostrar un error explícito
// (bug real que existió antes de unificar esto acá).
export const RUTA_POR_DEFECTO = {
  psicologo: '/dashboard',
  superadmin: '/panel-maestro',
  paciente: '/encuesta',
};
