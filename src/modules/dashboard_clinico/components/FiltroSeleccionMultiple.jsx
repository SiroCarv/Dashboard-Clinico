// Filtro de selección múltiple genérico, como dropdown con checkboxes.
// Nuevo (corrección posterior a SCRUM-56): el Panel Consolidado no tenía
// ningún filtro por instrumento — se agrega acá como selección múltiple
// porque a diferencia de institución/psicólogo (una sola opción tiene
// sentido a la vez), tiene sentido pedir "Estrés y Ansiedad" al mismo
// tiempo, por ejemplo.
//
// Selección vacía = "todos" (sin filtrar) — no hay una opción "Todos"
// separada compitiendo con las demás; deseleccionar todo ya significa
// eso. Se cierra al hacer clic afuera; NO se cierra al marcar una
// opción, porque justamente se espera marcar varias seguidas.
import { useEffect, useRef, useState } from 'react';

export function FiltroSeleccionMultiple({ etiqueta, etiquetaTodos, opciones, seleccionados, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);

  useEffect(() => {
    function alClickearFuera(evento) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', alClickearFuera);
    return () => document.removeEventListener('mousedown', alClickearFuera);
  }, []);

  const alternarOpcion = (valor) => {
    const siguiente = new Set(seleccionados);
    if (siguiente.has(valor)) siguiente.delete(valor);
    else siguiente.add(valor);
    onCambiar(siguiente);
  };

  const textoBoton =
    seleccionados.size === 0 || seleccionados.size === opciones.length
      ? etiquetaTodos
      : `${seleccionados.size} de ${opciones.length} seleccionados`;

  return (
    <div className="relative" ref={contenedorRef}>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">{etiqueta}</label>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800 bg-white flex items-center justify-between gap-2"
      >
        <span className="truncate">{textoBoton}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {abierto && (
        <div className="absolute z-20 mt-1 w-full min-w-56 bg-white border border-gray-300 rounded-md shadow-lg p-2">
          {opciones.map((opcion) => (
            <label
              key={opcion.valor}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm text-gray-800"
            >
              <input
                type="checkbox"
                checked={seleccionados.has(opcion.valor)}
                onChange={() => alternarOpcion(opcion.valor)}
                className="accent-violet-400"
              />
              {opcion.etiqueta}
            </label>
          ))}
          {seleccionados.size > 0 && (
            <button
              type="button"
              onClick={() => onCambiar(new Set())}
              className="mt-1 w-full text-xs font-semibold text-gray-600 hover:text-orange-800 px-2 py-1 text-left transition-colors"
            >
              Limpiar selección
            </button>
          )}
        </div>
      )}
    </div>
  );
}
