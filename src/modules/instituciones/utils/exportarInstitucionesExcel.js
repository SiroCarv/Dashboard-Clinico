// Exporta el LISTADO de instituciones del Panel Maestro (pestaña
// "Instituciones") a Excel, una fila por institución.
//
// Se mantiene separado de shared/utils/exportarExcel.js a propósito: ese
// archivo es genérico y no debe conocer el dominio — acá se traducen los
// campos de la tabla `instituciones` a encabezados legibles en español.
//
// Recibe el array YA FILTRADO que muestra la pantalla (búsqueda + tipo):
// el archivo debe reflejar exactamente lo que se ve, nunca la tabla
// completa de la base de datos.
import {
  exportarAExcel,
  generarNombreArchivoConFecha,
  formatearFechaExcel,
} from '../../../shared/utils/exportarExcel';
import { obtenerLabelTipo } from '../data/tiposInstitucion';

/**
 * @param {Array<{ nombre: string, tipo_institucion: string | null, codigo_registro: string, created_at: string | null }>} instituciones - Instituciones ya filtradas (mismo array que pinta `InstitucionList`).
 * @returns {Promise<void>}
 */
export async function exportarInstitucionesAExcel(instituciones) {
  const filas = instituciones.map((inst) => ({
    Nombre: inst.nombre,
    // Mismo fallback que la tabla en pantalla: una institución antigua sin
    // tipo guardado se muestra (y se exporta) como Unidad Educativa.
    Tipo: obtenerLabelTipo(inst.tipo_institucion),
    'Código de acceso': inst.codigo_registro,
    'Fecha de alta': formatearFechaExcel(inst.created_at),
  }));

  await exportarAExcel(filas, generarNombreArchivoConFecha('instituciones'), 'Instituciones', {
    ajustarColumnas: true,
  });
}