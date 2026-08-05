import { MISION, VISION } from '../data/contenidoInstitucional';

// Sección que aparece al hacer scroll hacia abajo desde el Hero:
// Misión y Visión institucional. Reutiliza el mismo patrón de
// tarjeta (franja naranja superior) que las pantallas de auth, para
// mantener el mismo sistema visual en toda la app.
export default function SeccionMisionVision() {
  return (
    <section className="bg-gray-100 py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
        <div className="bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">
          <h2 className="text-2xl font-extrabold text-black mb-4">Misión</h2>
          <p className="text-gray-600 leading-relaxed">{MISION}</p>
        </div>

        <div className="bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">
          <h2 className="text-2xl font-extrabold text-black mb-4">Visión</h2>
          <p className="text-gray-600 leading-relaxed">{VISION}</p>
        </div>
      </div>
    </section>
  );
}