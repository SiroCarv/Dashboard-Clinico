// Barra superior fija (sticky), reutilizada por las pantallas privadas
// de paciente y psicólogo (Encuesta, Dashboard, Informe Consolidado):
// un título a la izquierda y el botón de cerrar sesión a la derecha,
// siempre visible aunque la página tenga scroll.
//
// Importa BotonCerrarSesion desde la API pública del módulo
// `autenticacion` (nunca desde su ruta interna) — es la única forma de
// consumo cruzado entre módulos que permite la arquitectura del
// proyecto.
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
