// Traduce el listado de pacientes visible en el Dashboard (la misma forma
// que ya consume `TablaPacientes`, ver
// `pacientesService.obtenerPacientesPropios()`) al formato de fila que
// espera el Excel exportado: encabezados legibles en español, nunca los
// nombres técnicos de columna de Supabase (`institucion_id`, etc.).
//
// Reemplaza a `exportarHistorialExcel.js` (historia "Exportación a
// Excel", SCRUM-14). Esa versión exportaba evaluaciones PHQ-9 con
// diagnóstico y puntaje — formato que dejó de tener sentido al retirar
// esa pantalla en favor del modelo multi-instrumento por paciente
// (SCRUM-31). El Dashboard ya no tiene una vista de "evaluaciones", tiene
// una de "pacientes", así que esto exporta un padrón de personas, no un
// instrumento puntual.
//
// Se mantiene separado de `shared/utils/exportarExcel.js` a propósito:
// ese archivo es genérico y no debe conocer nada del dominio clínico
// ("participante", "consultante", "institución").

import { exportarAExcel } from '../../../shared/utils/exportarExcel';
import {
  obtenerNombreMostrado,
  obtenerEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

/**
 * Arma el nombre `listado_pacientes_AAAA-MM-DD.xlsx` usando la fecha
 * LOCAL del equipo de quien exporta, no UTC, para que coincida con el día
 * que esa persona ve en su propio reloj al momento de exportar (mismo
 * criterio que ya usaba `exportarHistorialExcel.js`).
 *
 * @returns {string}
 */
function generarNombreArchivo() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `listado_pacientes_${anio}-${mes}-${dia}.xlsx`;
}

/**
 * Convierte el array de pacientes YA FILTRADOS visibles en el Dashboard
 * (mismo criterio de aceptación #3 de SCRUM-14: el archivo debe reflejar
 * exactamente lo que la búsqueda/filtros dejan en pantalla, nunca el
 * padrón completo de la base de datos) en filas de Excel con encabezados
 * legibles, y dispara la descarga.
 *
 * @param {Array<object>} pacientes - Pacientes ya filtrados (mismo array que recibe `TablaPacientes`).
 * @returns {Promise<void>}
 */
export async function exportarPacientesAExcel(pacientes) {
  const filas = pacientes.map((p) => ({
    Nombre: obtenerNombreMostrado(p),
    Tipo: obtenerEtiquetaIdentidad(p),
    Correo: p.email || '—',
    Institución: p.institucion?.nombre || '—',
    Curso: p.curso || '—',
    Paralelo: p.paralelo || '—',
  }));

  await exportarAExcel(filas, generarNombreArchivo(), 'Pacientes');
}