// Traduce el historial de evaluaciones (la misma forma que ya consume
// `TablaHistorialEvaluaciones`, ver `evaluacionesService.obtenerHistorial()`)
// al formato de fila que espera el Excel exportado: encabezados legibles
// en español, nunca los nombres técnicos de columna de Supabase
// (`id_paciente`, `fecha_registro`, etc. — criterio de aceptación #4 de
// la historia "Exportación a Excel", SCRUM-14).
//
// Se mantiene separado de `shared/utils/exportarExcel.js` a propósito:
// ese archivo es genérico y no debe conocer nada de "evaluaciones",
// "diagnóstico" ni "alerta_activada". Este sí conoce ese dominio, así
// que vive dentro de `dashboard_clinico` y no en `shared/`.
//
// Nota de terminología: el criterio de aceptación original de Jira usa
// "Paciente" como ejemplo de encabezado. Esa historia se escribió antes
// de "Nueva Terminología de Usuarios" (SCRUM-32), que ya eliminó la
// palabra "Paciente" de toda la interfaz (Participante / Consultante,
// ver `shared/utils/identidadUsuario.js`). Para no reintroducir un
// término retirado deliberadamente, acá se usan las columnas "Nombre" +
// "Tipo" en su lugar. Si se prefiere el literal "Paciente", es un cambio
// de una sola línea.

import { exportarAExcel } from '../../../shared/utils/exportarExcel';
import {
  obtenerNombreMostrado,
  obtenerEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

function formatearFechaParaExcel(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Arma el nombre `historial_clinico_AAAA-MM-DD.xlsx` (criterio de
 * aceptación #5) usando la fecha LOCAL del equipo de quien exporta, no
 * UTC, para que coincida con el día que esa persona ve en su propio
 * reloj al momento de exportar.
 *
 * @returns {string}
 */
function generarNombreArchivo() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `historial_clinico_${anio}-${mes}-${dia}.xlsx`;
}

/**
 * Convierte el array de evaluaciones YA FILTRADAS visibles en el
 * Dashboard (criterio de aceptación #3: el archivo debe reflejar
 * exactamente lo que la búsqueda/filtros dejan en pantalla, nunca el
 * historial completo de la base de datos) en filas de Excel con
 * encabezados legibles, y dispara la descarga.
 *
 * @param {Array<object>} evaluaciones - Evaluaciones ya filtradas (mismo array que recibe `TablaHistorialEvaluaciones`).
 * @returns {Promise<void>}
 */
export async function exportarHistorialAExcel(evaluaciones) {
  const filas = evaluaciones.map((ev) => ({
    Nombre: obtenerNombreMostrado(ev.paciente),
    Tipo: obtenerEtiquetaIdentidad(ev.paciente),
    Correo: ev.paciente?.email || '—',
    Institución: ev.paciente?.institucion?.nombre || '—',
    Fecha: formatearFechaParaExcel(ev.fecha_registro),
    Puntaje: ev.puntaje_total,
    Diagnóstico: ev.diagnostico,
    Alerta: ev.alerta_activada ? 'Sí' : 'No',
  }));

  await exportarAExcel(filas, generarNombreArchivo(), 'Historial Clínico');
}