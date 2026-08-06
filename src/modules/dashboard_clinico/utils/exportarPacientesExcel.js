// Exporta el LISTADO de pacientes del Dashboard (padrón completo de
// personas, una fila por paciente) — no confundir con
// exportarInformePacienteExcel.js, que exporta las respuestas detalladas
// de UN paciente puntual.
//
// Se mantiene separado de shared/utils/exportarExcel.js a propósito: ese
// archivo es genérico y no debe conocer nada del dominio clínico
// ("participante", "consultante", "institución") — acá sí se traducen
// los nombres técnicos de columna a encabezados legibles en español.
import { exportarAExcel } from '../../../shared/utils/exportarExcel';
import {
  obtenerNombreMostrado,
  obtenerEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

/**
 * Arma el nombre `listado_pacientes_AAAA-MM-DD.xlsx` usando la fecha
 * LOCAL del equipo de quien exporta, no UTC, para que coincida con el día
 * que esa persona ve en su propio reloj al momento de exportar.
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
 * (el archivo debe reflejar exactamente lo que la búsqueda/filtros dejan
 * en pantalla, nunca el padrón completo de la base de datos) en filas de
 * Excel con encabezados legibles, y dispara la descarga.
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
