import { useState, useEffect } from 'react';

// Hook genérico de autoplay para un carrusel de imágenes.
// No conoce el contenido (imágenes, textos): solo recibe cuántos
// elementos hay y cada cuánto tiempo debe avanzar, y devuelve el
// índice actual + una función para saltar a un índice puntual (usada
// por los puntos de navegación del carrusel).
export function useCarrusel(totalImagenes, intervaloMs) {
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    // Con 0 o 1 imagen no tiene sentido programar el intervalo.
    if (totalImagenes <= 1) return;

    const intervalo = setInterval(() => {
      setIndiceActual((indicePrevio) => (indicePrevio + 1) % totalImagenes);
    }, intervaloMs);

    return () => clearInterval(intervalo);
  }, [totalImagenes, intervaloMs]);

  const irAImagen = (indice) => setIndiceActual(indice);

  return { indiceActual, irAImagen };
}