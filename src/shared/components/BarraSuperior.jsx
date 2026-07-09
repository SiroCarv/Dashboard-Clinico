import { BotonCerrarSesion } from '../../modules/autenticacion';

export default function BarraSuperior({ titulo }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-black">{titulo}</h1>
        <BotonCerrarSesion />
      </div>
    </header>
  );
}