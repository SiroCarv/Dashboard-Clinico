// Sección de Inicio de la landing pública: imágenes institucionales que
// rotan solas a pantalla completa, con la barra de navegación
// (NavbarFlotante) flotando por encima. id="inicio" es el ancla que usa
// el link "Inicio" de esa barra.
import { useCarrusel } from '../hooks/useCarrusel';
import { IMAGENES_HERO, DURACION_CAMBIO_IMAGEN_MS } from '../data/contenidoInstitucional';

export default function Carrusel() {
  const { indiceActual, irAImagen } = useCarrusel(IMAGENES_HERO.length, DURACION_CAMBIO_IMAGEN_MS);

  return (
    <section id="inicio" className="relative h-screen w-full overflow-hidden">
      {IMAGENES_HERO.map((imagen, indice) => (
        <img
          key={imagen.id}
          src={imagen.url}
          alt={imagen.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            indice === indiceActual ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg max-w-3xl">
          Observatorio de Salud Mental
        </h1>
      </div>

      {/* Corrección: apuntaba a #mision-vision pero esa sección nunca tuvo
          ese id -- el link nunca funcionó. Corregido junto con
          SeccionMisionVision.jsx. */}
      <a
        href="#mision-vision"
        className="absolute bottom-20 inset-x-0 z-10 flex flex-col items-center gap-1 text-white/90 hover:text-white transition-colors animate-bounce"
      >
        <span className="text-sm font-semibold uppercase tracking-wide drop-shadow-lg">
          Conocé nuestra misión y visión
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 drop-shadow-lg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </a>

      <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center gap-2">
        {IMAGENES_HERO.map((imagen, indice) => (
          <button
            key={imagen.id}
            type="button"
            onClick={() => irAImagen(indice)}
            aria-label={`Ir a la imagen ${indice + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              indice === indiceActual ? 'w-8 bg-orange-700' : 'w-2.5 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
