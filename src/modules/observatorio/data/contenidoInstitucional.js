// Contenido estático de la landing pública (Home).
//
// Historia "Landing pública institucional" — Épica "Observatorio de
// Salud Mental" (pendiente de confirmación de alcance con la
// Licenciada, ver mensaje enviado).
//
// Las imágenes son PLACEHOLDERS TEMPORALES generados con un servicio
// de bloques de color (no son fotografías reales ni de stock, para
// no dejar contenido con licencia dudosa en el repositorio). Usan los
// mismos tonos de marca que src/shared/theme/paletaColores.js.
// Reemplazar `url` por la ruta real cuando el cliente entregue las
// fotos definitivas — no hace falta tocar ningún componente.

export const IMAGENES_HERO = [
  {
    id: 1,
    url: 'https://placehold.co/1920x1080/f97316/ffffff?text=Observatorio+de+Salud+Mental',
    alt: 'Observatorio de Salud Mental (imagen institucional, placeholder temporal)',
  },
  {
    id: 2,
    url: 'https://placehold.co/1920x1080/14b8a6/ffffff?text=Diagnostico+Temprano',
    alt: 'Diagnóstico temprano y prevención (placeholder temporal)',
  },
  {
    id: 3,
    url: 'https://placehold.co/1920x1080/10b981/ffffff?text=Evidencia+para+Decidir',
    alt: 'Evidencia para decidir (placeholder temporal)',
  },
  {
    id: 4,
    url: 'https://placehold.co/1920x1080/a78bfa/ffffff?text=Redes+para+Cuidar',
    alt: 'Redes para cuidar (placeholder temporal)',
  },
];

// Tiempo que cada imagen permanece visible antes de pasar a la
// siguiente. "No tan lento" pedido por el cliente → 4 segundos.
export const DURACION_CAMBIO_IMAGEN_MS = 4000;

export const MISION =
  'Generar, analizar y difundir información científica y contextualizada sobre la salud mental en Santa Cruz y Bolivia, con el fin de orientar políticas públicas, fortalecer prácticas clínicas y promover el bienestar emocional en distintos entornos sociales.';

export const VISION =
  'Ser el principal referente regional en monitoreo, investigación, formación y articulación interinstitucional en temas de salud mental, contribuyendo a la construcción de una sociedad más saludable, informada y resiliente.';