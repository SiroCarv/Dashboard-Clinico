// Listas fijas de curso/paralelo/turno para el formulario de Reportes de
// Docente -- mismos valores exactos que usa el registro real de
// estudiantes (autenticacion/pages/Registro.jsx: OPCIONES_CURSO/
// OPCIONES_PARALELO/OPCIONES_TURNO), porque acá se describe a un alumno
// real, no un filtro de búsqueda (a diferencia de
// dashboard_clinico/data/opcionesEscolares.js, que a propósito amplía el
// paralelo hasta J solo para el filtro del psicólogo). Se duplican acá
// en vez de importarse desde `autenticacion` -- ningún módulo puede
// importar de otro, mismo criterio ya usado en gshsData.js y
// opcionesEscolares.js.
export const OPCIONES_CURSO = [
  '1ro de Secundaria',
  '2do de Secundaria',
  '3ro de Secundaria',
  '4to de Secundaria',
  '5to de Secundaria',
  '6to de Secundaria',
];
export const OPCIONES_PARALELO = ['A', 'B', 'C', 'D', 'E', 'F'];
export const OPCIONES_TURNO = ['Mañana', 'Tarde'];