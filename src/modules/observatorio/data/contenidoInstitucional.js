// Contenido estático de la landing pública (Home): imágenes del
// carrusel, cuánto dura cada una en pantalla, y los textos de Misión y
// Visión institucional.
//
// Épica "Observatorio de Salud Mental" — landing pública pendiente de
// confirmación final de alcance con la Licenciada.
//
// Las imágenes son PLACEHOLDERS TEMPORALES generados con un servicio
// de bloques de color (no son fotografías reales ni de stock, para
// no dejar contenido con licencia dudosa en el repositorio). Usan los
// mismos tonos de marca que src/shared/theme/paletaColores.js.
// Reemplazar cada `img` por la foto real cuando el cliente la entregue —
// no hace falta tocar ningún componente, solo estos imports.

import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img4 from '../assets/img4.jpg';
import img5 from '../assets/img5.jpg';


export const IMAGENES_HERO = [
  {
    id: 1,
    url: img1,
    alt: 'img inicio',
  },
  {
    id: 2,
    url: img2,
    alt: 'img inicio',
  },
  {
    id: 3,
    url: img3,
    alt: 'img inicio',
  },
  {
    id: 4,
    url: img4,
    alt: 'img inicio',
  },
  {
    id: 5,
    url: img5,
    alt: 'img inicio',
  },
];

// Tiempo que cada imagen permanece visible antes de pasar a la
// siguiente. "No tan lento" pedido por el cliente → 4 segundos.
export const DURACION_CAMBIO_IMAGEN_MS = 4000;

export const MISION =
  'Generar, analizar y difundir información científica y contextualizada sobre la salud mental en Santa Cruz y Bolivia, con el fin de orientar políticas públicas, fortalecer prácticas clínicas y promover el bienestar emocional en distintos entornos sociales.';

export const VISION =
  'Ser el principal referente regional en monitoreo, investigación, formación y articulación interinstitucional en temas de salud mental, contribuyendo a la construcción de una sociedad más saludable, informada y resiliente.';
