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

/**
 * Genera un archivo .xlsx a partir de un array de objetos planos y
 * dispara su descarga inmediata en el navegador.
 *
 * @param {Array<Record<string, string | number>>} filas - Cada objeto es una fila; sus claves ya deben ser los encabezados finales (ej. "Fecha"), nunca nombres técnicos de columna.
 * @param {string} nombreArchivo - Nombre completo del archivo, incluida la extensión `.xlsx`.
 * @param {string} [nombreHoja='Datos'] - Nombre de la pestaña dentro del libro de Excel.
 * @returns {Promise<void>}
 */
export async function exportarAExcel(filas, nombreArchivo, nombreHoja = 'Datos') {
  const XLSX = await import('xlsx');
  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  XLSX.writeFile(libro, nombreArchivo);
}
