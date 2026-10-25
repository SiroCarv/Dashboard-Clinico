// Utilidad genérica de exportación a Excel, usando SheetJS (xlsx).
//
// Vive en `shared/` a propósito: no conoce nada del dominio clínico (no
// sabe qué es un "diagnóstico" ni una "evaluación"), solo sabe convertir
// un array de objetos planos —cuyas claves YA deben ser los encabezados
// legibles finales— en un archivo .xlsx y disparar su descarga. Cualquier
// módulo futuro que necesite exportar datos a Excel puede reutilizarla
// sin duplicar lógica de SheetJS ni violar la regla de que un módulo no
// puede importar de otro módulo.
//
// Todo el procesamiento ocurre en el navegador de quien exporta: no se
// envía ningún dato a un servidor externo (obligatorio al tratarse de
// información clínica sensible).
//
// SheetJS se importa de forma DIFERIDA (dynamic import), no en el top
// del archivo. La librería completa pesa varios cientos de KB y, si se
// importa de forma estática, Vite la empaqueta dentro del chunk principal
// que descarga CUALQUIER persona que abre la app (login, registro, la
// encuesta del paciente...), aunque nunca exporte nada. Con el import
// dinámico, ese peso solo se descarga la primera vez que alguien realmente
// presiona "Exportar a Excel".
//
// Los helpers de nombre de archivo y de fecha de abajo los usan las
// exportaciones del superadmin (instituciones, psicólogos, resultados
// globales). Las exportaciones anteriores del Dashboard del psicólogo
// conservan sus propias copias locales y no dependen de estos helpers.

/**
 * Arma un nombre de archivo `prefijo_AAAA-MM-DD.xlsx` con la fecha LOCAL
 * del equipo de quien exporta (no UTC), para que coincida con el día que
 * esa persona ve en su propio reloj al momento de exportar.
 *
 * @param {string} prefijo - Parte fija del nombre, sin extensión (ej. "instituciones").
 * @returns {string}
 */
export function generarNombreArchivoConFecha(prefijo) {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${prefijo}_${anio}-${mes}-${dia}.xlsx`;
}

/**
 * Fecha como `dd/mm/aaaa` en la zona horaria del equipo (mismo formato que
 * ya se ve en pantalla en el panel del superadmin). Devuelve "—" si no hay
 * fecha, para que la celda de Excel nunca quede en blanco sin explicación.
 *
 * @param {string | Date | null | undefined} fecha
 * @returns {string}
 */
export function formatearFechaExcel(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Hora como `hh:mm` en la zona horaria del equipo. Mismo criterio que
 * `formatearFechaExcel` para el caso sin fecha.
 *
 * @param {string | Date | null | undefined} fecha
 * @returns {string}
 */
export function formatearHoraExcel(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

// Ancho de columna (en caracteres) según el texto más largo de cada una,
// con tope para que un valor muy largo no deje la hoja ilegible.
const ANCHO_MIN_COLUMNA = 10;
const ANCHO_MAX_COLUMNA = 60;

function calcularAnchosColumnas(filas) {
  return Object.keys(filas[0]).map((encabezado) => {
    const largoMaximo = filas.reduce(
      (max, fila) => Math.max(max, String(fila[encabezado] ?? '').length),
      encabezado.length
    );
    return { wch: Math.min(Math.max(largoMaximo + 2, ANCHO_MIN_COLUMNA), ANCHO_MAX_COLUMNA) };
  });
}

/**
 * Genera un archivo .xlsx a partir de un array de objetos planos y
 * dispara su descarga inmediata en el navegador.
 *
 * @param {Array<Record<string, string | number>>} filas - Cada objeto es una fila; sus claves ya deben ser los encabezados finales (ej. "Fecha"), nunca nombres técnicos de columna.
 * @param {string} nombreArchivo - Nombre completo del archivo, incluida la extensión `.xlsx`.
 * @param {string} [nombreHoja='Datos'] - Nombre de la pestaña dentro del libro de Excel.
 * @param {{ ajustarColumnas?: boolean }} [opciones] - `ajustarColumnas` (por defecto false, para no cambiar las exportaciones que ya existen) ajusta el ancho de cada columna a su contenido.
 * @returns {Promise<void>}
 */
export async function exportarAExcel(filas, nombreArchivo, nombreHoja = 'Datos', opciones = {}) {
  const XLSX = await import('xlsx');
  const hoja = XLSX.utils.json_to_sheet(filas);
  if (opciones.ajustarColumnas && filas.length > 0) {
    hoja['!cols'] = calcularAnchosColumnas(filas);
  }
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  XLSX.writeFile(libro, nombreArchivo);
}