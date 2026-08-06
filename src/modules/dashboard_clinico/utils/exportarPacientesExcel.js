// Exporta el Informe Consolidado de UN paciente puntual: una fila por
// cada pregunta respondida, en cada instrumento que haya completado.
// Complementa a `exportarPacientesExcel.js` (que exporta el padrón
// completo, una fila por persona) — este es el export individual pedido
// para la pantalla de Informe Consolidado.

import { exportarAExcel } from '../../../shared/utils/exportarExcel';
import {
  obtenerNombreMostrado,
  obtenerEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

const ETIQUETA_INSTRUMENTO = {
  CLIMA_AULA: 'Cuestionario de Clima de Aula',
  GSHS: 'Encuesta Mundial de Salud a Escolares (GSHS)',
};

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Mismo criterio de nombre de archivo "seguro" que ya usaba el export de
// detalle clínico: sin acentos ni espacios, para que descargue bien en
// cualquier sistema operativo.
function generarNombreArchivo(paciente) {
  const nombreSeguro = obtenerNombreMostrado(paciente)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_');
  return `informe_${nombreSeguro}.xlsx`;
}

/**
 * @param {object} paciente - Mismo objeto que recibe `InformeConsolidadoPaciente`.
 * @param {Array<object>} instrumentos - Mismo array (cada uno con `respuestas_json`).
 * @returns {Promise<void>}
 */
export async function exportarInformePacienteAExcel(paciente, instrumentos) {
  const nombre = obtenerNombreMostrado(paciente);
  const tipo = obtenerEtiquetaIdentidad(paciente);
  const institucion = paciente.institucion?.nombre || '—';

  const filas = instrumentos.flatMap((registro) =>
    (registro.respuestas_json ?? []).map((respuesta) => ({
      Nombre: nombre,
      Tipo: tipo,
      Institución: institucion,
      Instrumento: ETIQUETA_INSTRUMENTO[registro.tipo_instrumento] ?? registro.tipo_instrumento,
      'Fecha de envío': formatearFecha(registro.fecha_registro),
      Módulo: respuesta.modulo,
      'N° pregunta': respuesta.numero,
      Respuesta:
        typeof respuesta.valor === 'boolean'
          ? respuesta.valor
            ? 'Verdadero'
            : 'Falso'
          : respuesta.valor,
    }))
  );

  // Si todavía no completó ningún instrumento, igual se genera un archivo
  // (con una sola fila avisándolo) en vez de fallar o exportar vacío sin
  // explicación.
  const filasFinales =
    filas.length > 0
      ? filas
      : [
          {
            Nombre: nombre,
            Tipo: tipo,
            Institución: institucion,
            Aviso: 'Todavía no completó ningún instrumento',
          },
        ];

  await exportarAExcel(filasFinales, generarNombreArchivo(paciente), 'Informe');
}