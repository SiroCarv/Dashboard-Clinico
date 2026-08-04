import { useCarrusel } from '../hooks/useCarrusel';
import { IMAGENES_HERO, DURACION_CAMBIO_IMAGEN_MS } from '../data/contenidoInstitucional';

// Sección de Inicio: imágenes institucionales que rotan solas, a
// pantalla completa, con la barra de navegación flotando por encima.
// id="inicio" es el ancla que usa el link "Inicio" de NavbarFlotante.
export default function HeroCarrusel() {
  const { indiceActual, irAImagen } = useCarrusel(
    IMAGENES_HERO.length,
    DURACION_CAMBIO_IMAGEN_MS
  );

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

      {/* Capa oscura para que el texto sea legible sobre cualquier imagen del ciclo */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg max-w-3xl">
          Observatorio de Salud Mental
        </h1>
        <p className="text-white text-lg md:text-2xl font-medium mt-4 max-w-2xl drop-shadow-lg">
          Datos para prevenir · Evidencia para decidir · Redes para cuidar
        </p>
      </div>

      {/* Puntos de navegación manual del carrusel */}
      <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center gap-2">
        {IMAGENES_HERO.map((imagen, indice) => (
          <button
            key={imagen.id}
            type="button"
            onClick={() => irAImagen(indice)}
            aria-label={`Ir a la imagen ${indice + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              indice === indiceActual ? 'w-8 bg-orange-500' : 'w-2.5 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}