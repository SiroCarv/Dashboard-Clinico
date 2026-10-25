// Exporta el LISTADO de psicólogos del Panel Maestro (pestaña
// "Psicólogos") a Excel, una fila por cuenta, con la institución a la que
// está asignada cada uno.
//
// Vive en `instituciones` y no en `psicologos` porque la tabla de
// pantalla (AsignacionPsicologos.jsx) es la que cruza el psicólogo con su
// institución; el módulo `psicologos` solo maneja el alta, edición y baja
// de la cuenta. La etiqueta de turno se toma de la API pública de
// `psicologos`, nunca de una ruta interna.
//
// Recibe los psicólogos YA FILTRADOS que muestra la pantalla (búsqueda por
// nombre/correo): el archivo refleja lo que se ve, no todas las cuentas.
import {
  exportarAExcel,
  generarNombreArchivoConFecha,
  formatearFechaExcel,
} from '../../../shared/utils/exportarExcel';
import { ETIQUETA_TURNO_PSICOLOGO } from '../../psicologos';

/**
 * @param {Array<{ id: string, nombre: string | null, email: string | null, turno_psicologo: string | null, created_at: string | null }>} psicologos - Psicólogos ya filtrados.
 * @param {Array<{ psicologo_id: string, institucion_id: string }>} asignaciones - Todas las asignaciones (a lo sumo una por psicólogo).
 * @param {Array<{ id: string, nombre: string }>} instituciones - Catálogo de instituciones, para traducir el id a nombre.
 * @returns {Promise<void>}
 */
export async function exportarPsicologosAExcel(psicologos, asignaciones, instituciones) {
  const nombrePorInstitucionId = new Map(instituciones.map((inst) => [inst.id, inst.nombre]));
  const institucionIdPorPsicologoId = new Map(
    asignaciones.map((a) => [a.psicologo_id, a.institucion_id])
  );

  const filas = psicologos.map((psico) => {
    const institucionId = institucionIdPorPsicologoId.get(psico.id);

    return {
      Nombre: psico.nombre || '—',
      Correo: psico.email || '—',
      'Turno / Cargo': ETIQUETA_TURNO_PSICOLOGO[psico.turno_psicologo] || 'Sin definir',
      'Fecha de alta': formatearFechaExcel(psico.created_at),
      'Institución asignada': nombrePorInstitucionId.get(institucionId) || 'Sin institución asignada',
    };
  });

  await exportarAExcel(filas, generarNombreArchivoConFecha('psicologos'), 'Psicólogos', {
    ajustarColumnas: true,
  });
}