// Listas fijas de curso/paralelo/turno/género (SCRUM-59 + corrección
// posterior de género), extraídas de Dashboard.jsx para que
// useResumenFormularios.js las use también.
//
// Corrección: el filtro de curso/paralelo/turno del panel de gráficas
// (FiltrosResumen.jsx) derivaba sus opciones de `valoresUnicos(pacientes,
// campo)` — solo mostraba los valores que YA existían entre los
// estudiantes cargados, a diferencia del filtro de la tabla de
// Dashboard.jsx, que siempre muestra las 6 opciones de curso, las 10 de
// paralelo (A a la J) y las 2 de turno, existan o no estudiantes en cada
// una todavía. Esa diferencia era justamente el bug reportado ("sigue
// sin mostrarse bien"): dos filtros con el mismo nombre, en la misma
// pantalla, mostrando conjuntos de opciones distintos. Ahora ambos
// importan de acá, así que no pueden volver a desincronizarse.
//
// Género (corrección posterior, mismo bug que el de arriba): el filtro
// "Sexo" del panel de gráficas quedó afuera de la corrección de
// SCRUM-59 — seguía derivando sus opciones de
// `valoresUnicos(pacientes, 'genero')` en useResumenFormularios.js, así
// que con pocos estudiantes cargados (o ninguno con ese campo en la
// institución filtrada) el select quedaba deshabilitado o mostraba un
// solo género. Se agrega acá con el mismo criterio fijo que curso/
// paralelo/turno, para que el filtro siempre ofrezca las 3 opciones.
//
// Los valores de curso/turno/género coinciden exactamente con las
// opciones reales de registro (autenticacion/pages/Registro.jsx:
// OPCIONES_CURSO/OPCIONES_TURNO/OPCIONES_GENERO); paralelo es una
// decisión explícita del cliente para que el filtro cubra el rango
// completo A-J aunque el registro real solo permita A-F por ahora. Se
// duplican acá en vez de importarse desde `autenticacion` (ningún módulo
// puede importar de otro) — mismo criterio de duplicación consciente que
// ya usa gshsData.js.
export const OPCIONES_CURSO = [
  '1ro de Secundaria',
  '2do de Secundaria',
  '3ro de Secundaria',
  '4to de Secundaria',
  '5to de Secundaria',
  '6to de Secundaria',
];
export const OPCIONES_PARALELO = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const OPCIONES_TURNO = ['Mañana', 'Tarde'];
export const OPCIONES_GENERO = ['Masculino', 'Femenino', 'Prefiero no decir'];