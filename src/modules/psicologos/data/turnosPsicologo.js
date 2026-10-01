// Etiqueta de turno/cargo del psicólogo. Es solo una etiqueta informativa
// (quién coordina, quién atiende de mañana o de tarde): NO cambia los
// permisos de la cuenta. Los valores son los que acepta la columna
// `usuarios.turno_psicologo` en la base y las Edge Functions
// crear-psicologo / editar-psicologo.
export const OPCIONES_TURNO_PSICOLOGO = [
  { valor: 'coordinador', etiqueta: 'Coordinador / General' },
  { valor: 'manana', etiqueta: 'Turno Mañana' },
  { valor: 'tarde', etiqueta: 'Turno Tarde' },
];

export const ETIQUETA_TURNO_PSICOLOGO = Object.fromEntries(
  OPCIONES_TURNO_PSICOLOGO.map((o) => [o.valor, o.etiqueta])
);
