// Etiqueta visible para `tipoPersona` ('estudiante' | 'docente' | null),
// el mismo dato que ya calcula pacientesService.js (SCRUM-53: quién
// originó el registro, autoenvío del propio estudiante o caso
// registrado por un docente en su nombre). Hasta la corrección de
// terminología "Paciente → Estudiante" este dato solo se usaba para
// FILTRAR (Dashboard.jsx), nunca se mostraba como etiqueta junto al
// nombre — acá se expone para reemplazar la vieja etiqueta
// Participante/Consultante (retirada, ver shared/utils/identidadUsuario.js)
// en TablaPacientes.jsx y exportarPacientesExcel.js.
//
// Vive DENTRO de `dashboard_clinico` (no en `shared/`) porque hoy solo
// este módulo lo consume — si otro módulo llegara a necesitarlo, se
// expone desde acá vía `dashboard_clinico/index.js` en vez de moverlo.
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';

export const ETIQUETA_TIPO_PERSONA = {
  estudiante: 'Estudiante',
  docente: 'Docente',
};

/**
 * @param {'estudiante' | 'docente' | null | undefined} tipoPersona
 * @returns {string} Clases de Tailwind — teal azulado para autoenvío del
 * estudiante (caso por defecto), violeta suave para registrado por un
 * docente (mismo criterio de color que ya usa OrigenRegistro en
 * TablaResultadosGlobales.jsx).
 */
export function obtenerEstiloTipoPersona(tipoPersona) {
  return tipoPersona === 'docente' ? COLOR_MARCA.violetaSuave.suave : COLOR_MARCA.tealAzulado.suave;
}
