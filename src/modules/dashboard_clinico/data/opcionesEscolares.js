// Listas fijas de curso/paralelo/turno (SCRUM-59), extraídas de
// Dashboard.jsx para que useResumenFormularios.js las use también.
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
// Los valores de curso/turno coinciden exactamente con las opciones
// reales de registro (autenticacion/pages/Registro.jsx: OPCIONES_CURSO/
// OPCIONES_TURNO); paralelo es una decisión explícita del cliente para
// que el filtro cubra el rango completo A-J aunque el registro real solo
// permita A-F por ahora. Se duplican acá en vez de importarse desde
// `autenticacion` (ningún módulo puede importar de otro) — mismo
// criterio de duplicación consciente que ya usa gshsData.js.
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
