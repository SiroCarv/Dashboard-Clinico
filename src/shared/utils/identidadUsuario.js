// Utilidad compartida para mostrar el nombre de un estudiante en
// distintas pantallas (tabla del dashboard, informe consolidado,
// exportación a Excel, panel consolidado del superadmin). Vive en
// `shared/` porque más de un módulo la necesita y la regla del proyecto
// prohíbe que un módulo importe directamente de otro.
//
// Historial: hasta la corrección de terminología "Paciente → Estudiante",
// este archivo distinguía entre "Participante" (con institución) y
// "Consultante" (sin institución). Se retiró junto con el resto de esa
// corrección: el registro de Consultante particular ya estaba retirado
// del sistema desde SCRUM-46/47/48 (ver Bienvenida.jsx/Registro.jsx), así
// que la distinción no podía darse en la práctica con datos nuevos.
// Donde hace falta distinguir "quién originó el registro" (autoenvío del
// estudiante vs. caso registrado por un docente), el proyecto ya tenía
// un concepto separado y vigente: `tipoPersona` en pacientesService.js /
// `registrado_por_docente_id` en resultadosGlobalesService.js.
export function obtenerNombreMostrado(persona) {
  return persona?.nombre || persona?.email || 'Estudiante desconocido';
}
