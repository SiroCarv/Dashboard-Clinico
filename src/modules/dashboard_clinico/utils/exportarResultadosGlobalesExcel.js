// Exporta a Excel los RESULTADOS del Panel Consolidado del superadmin
// (pestaña "Resultados"): una fila por formulario completado, con la
// persona, su institución y su psicólogo repetidos en cada fila.
//
// A diferencia de la tabla en pantalla (una fila por persona, con todos
// sus formularios adentro), el archivo es "plano" a propósito: una fila
// por resultado es lo que Excel necesita para filtrar, ordenar y armar
// tablas dinámicas sin tener que desarmar celdas con varios valores.
//
// Recibe los resultados YA FILTRADOS que alimentan la tabla (institución,
// psicólogo, formulario, fechas): el archivo refleja lo que se ve.
//
// GSHS — misma regla que TablaResultadosGlobales.jsx: nunca se lee
// `resultado_json` de este instrumento (son indicadores de un estudiante
// puntual). Su fila SÍ se exporta, con la columna Alerta según
// `alerta_activada`, y Puntaje/Categoría en "—".
//
// No se exportan respuestas individuales, carnet ni ningún dato de acceso:
// solo resultado, alerta y datos para ubicar a la persona.
import {
  exportarAExcel,
  generarNombreArchivoConFecha,
  formatearFechaExcel,
  formatearHoraExcel,
} from '../../../shared/utils/exportarExcel';
import { CATALOGO_FORMULARIOS_ESTUDIANTE } from '../../../shared/data/catalogoFormularios';
import { obtenerNombreMostrado } from '../../../shared/utils/identidadUsuario';
import { obtenerLabelTipo } from '../../instituciones';

const ETIQUETA_FORMULARIO = Object.fromEntries(
  CATALOGO_FORMULARIOS_ESTUDIANTE.map((f) => [f.tipo, f.etiqueta])
);

/**
 * @param {Array<object>} resultados - Resultados ya filtrados (mismo array que recibe `TablaResultadosGlobales`, antes de agruparlos por persona).
 * @returns {Promise<void>}
 */
export async function exportarResultadosGlobalesAExcel(resultados) {
  const filas = resultados.map((r) => {
    const institucion = r.paciente?.institucion;
    // Nunca se toca el detalle del GSHS (ver nota de archivo).
    const detalle = r.tipo_instrumento === 'GSHS' ? null : r.resultado_json;

    return {
      Estudiante: obtenerNombreMostrado(r.paciente),
      Institución: institucion?.nombre || '—',
      'Tipo de institución': institucion ? obtenerLabelTipo(institucion.tipo_institucion) : '—',
      'Psicólogo asignado': r.paciente?.psicologoResponsable?.nombre || '—',
      Formulario: ETIQUETA_FORMULARIO[r.tipo_instrumento] ?? r.tipo_instrumento,
      // Número real (no texto) para que Excel pueda sumar y promediar;
      // Bullying solo trae categoría, sin puntaje.
      Puntaje: detalle?.puntaje_total ?? '—',
      Categoría: detalle?.categoria ?? '—',
      Alerta: r.alerta_activada ? 'Sí' : 'No',
      // Mismo criterio que la tabla: solo se nombra la excepción (registrado
      // por un docente); el autoenvío del propio estudiante queda en "—".
      'Registrado por': r.registrado_por_docente_id ? r.docente?.nombre || 'Nombre no disponible' : '—',
      Fecha: formatearFechaExcel(r.fecha_registro),
      Hora: formatearHoraExcel(r.fecha_registro),
    };
  });

  await exportarAExcel(filas, generarNombreArchivoConFecha('resultados_globales'), 'Resultados', {
    ajustarColumnas: true,
  });
}