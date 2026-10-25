// Lee una consulta de Supabase completa pidiéndola por tandas con
// `.range()`, hasta que una tanda vuelve vacía.
//
// Por qué existe: PostgREST corta cada respuesta en un máximo de filas
// (por defecto 1,000 en Supabase, configurable en Settings → API → Max
// rows). Una consulta sin `.range()` que supere ese tope devuelve las
// primeras filas SIN ningún error ni aviso — la pantalla (y cualquier
// Excel armado a partir de ella) queda incompleta sin que nadie lo note.
//
// Corta SOLO cuando una tanda vuelve vacía, nunca "porque llegó menos de
// lo pedido": así sigue siendo correcto aunque el máximo configurado en el
// proyecto sea menor al tamaño de tanda que se pide acá. Cuesta una
// petición extra (la vacía del final) a cambio de no depender de ese dato.
//
// Si entran filas nuevas mientras se lee, una fila puede aparecer en dos
// tandas seguidas (el orden se corre una posición); `claveUnica` permite
// descartar esos repetidos sin perder ninguna fila.
//
// La consulta que se le pasa DEBE tener un orden total estable (ej.
// fecha + id como desempate); sin él, PostgreSQL no garantiza que las
// tandas no se pisen entre sí.

/**
 * @param {(desde: number, hasta: number) => PromiseLike<{ data: Array<object> | null, error: object | null }>} pedirTanda - Debe devolver la consulta ya acotada con `.range(desde, hasta)`.
 * @param {{ tamanoTanda?: number, claveUnica?: (fila: object) => string, maxTandas?: number }} [opciones]
 * @returns {Promise<Array<object>>}
 */
export async function leerEnTandas(pedirTanda, opciones = {}) {
  const { tamanoTanda = 1000, claveUnica, maxTandas = 500 } = opciones;
  const filas = [];
  let desde = 0;

  for (let n = 0; n < maxTandas; n += 1) {
    const { data, error } = await pedirTanda(desde, desde + tamanoTanda - 1);
    if (error) throw error;

    if (!data || data.length === 0) {
      if (!claveUnica) return filas;
      return Array.from(new Map(filas.map((fila) => [claveUnica(fila), fila])).values());
    }

    filas.push(...data);
    desde += data.length;
  }

  // Red de contención contra un bucle infinito (ej. una consulta mal
  // armada que nunca devuelve una tanda vacía).
  throw new Error(`La lectura por tandas superó el máximo de ${maxTandas} tandas.`);
}