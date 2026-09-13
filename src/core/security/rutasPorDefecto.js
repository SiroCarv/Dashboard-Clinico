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
//   - Login.jsx / LoginPersonaParticular.jsx: deciden a dónde navegar
//     justo después de un login exitoso.
//
// Por qué importa que todos usen este mismo objeto en vez de tener su
// propio if/else de roles: si cada uno tuviera su propia lógica, un rol
// nulo, vacío o desconocido podía terminar cayendo silenciosamente en la
// vista de paciente por accidente en vez de mostrar un error explícito
// (bug real que existió antes de unificar esto acá).
//
// persona_particular -> /encuesta-particular (NUEVO): ruta propia y
// separada de /encuesta, aunque ambas rendericen el mismo componente
// <Encuesta /> — RutaProtegida exige un `rolRequerido` exacto por ruta,
// así que dos roles distintos necesitan dos rutas distintas para poder
// entrar a la misma pantalla. Encuesta.jsx decide internamente, según el
// rol real, qué formularios mostrar (ver evaluaciones/pages/Encuesta.jsx).
export const RUTA_POR_DEFECTO = {
  psicologo: '/dashboard',
  superadmin: '/panel-maestro',
  paciente: '/encuesta',
  docente: '/registro-caso',
  persona_particular: '/encuesta-particular',
};