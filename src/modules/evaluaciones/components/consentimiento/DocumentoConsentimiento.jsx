import { useState } from 'react';

// Renderiza CUALQUIERA de las 3 variantes de textosConsentimiento.js.
// Reproduce el patrón del documento original en papel: hay que marcar
// TODAS las casillas antes de poder elegir la decisión final
// (autorizar / no autorizar).
export default function DocumentoConsentimiento({ contenido, onDecidir }) {
  const [checks, setChecks] = useState(() => contenido.checklist.map(() => false));
  const [enviando, setEnviando] = useState(null); // 'aceptar' | 'rechazar' | null
  const [error, setError] = useState('');

  const todoMarcado = checks.every(Boolean);

  const toggleCheck = (indice) => {
    setChecks((prev) => prev.map((v, i) => (i === indice ? !v : v)));
  };

  const handleDecidir = async (aceptado) => {
    setError('');
    setEnviando(aceptado ? 'aceptar' : 'rechazar');
    try {
      await onDecidir(aceptado);
    } catch (err) {
      console.error('Error al registrar la decisión de consentimiento:', err.message);
      setError('No se pudo registrar tu decisión. Intenta nuevamente.');
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div className="max-w-2xl w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-black">{contenido.titulo}</h2>
        <p className="text-gray-500 mt-2 font-medium">{contenido.subtitulo}</p>
      </div>

      <div className="text-sm text-gray-700 space-y-4 max-h-96 overflow-y-auto pr-2 mb-6 border border-gray-200 rounded-md p-4">
        <p className="font-medium">{contenido.intro}</p>

        {contenido.secciones.map((seccion) => (
          <div key={seccion.titulo}>
            <h3 className="font-extrabold text-black mb-1">{seccion.titulo}</h3>
            {seccion.parrafos.map((parrafo, i) => (
              <p key={i} className="mb-2 last:mb-0">
                {parrafo}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <p className="text-sm font-bold text-black mb-3">
          Marca cada casilla antes de continuar:
        </p>
        <div className="space-y-3">
          {contenido.checklist.map((texto, indice) => (
            <label key={indice} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks[indice]}
                onChange={() => toggleCheck(indice)}
                className="mt-1 h-4 w-4 accent-violet-400 rounded border-gray-300 focus:ring-violet-400"
              />
              <span className="text-sm text-gray-800 font-medium">{texto}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleDecidir(true)}
          disabled={!todoMarcado || enviando !== null}
          className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
            !todoMarcado || enviando !== null ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-400 hover:bg-orange-800'
          }`}
        >
          {enviando === 'aceptar' ? 'Guardando...' : contenido.autorizarLabel}
        </button>

        <button
          type="button"
          onClick={() => handleDecidir(false)}
          disabled={!todoMarcado || enviando !== null}
          className="w-full font-bold py-3 rounded-md transition-colors duration-300 uppercase tracking-wide border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando === 'rechazar' ? 'Guardando...' : contenido.noAutorizarLabel}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">{contenido.certificacion}</p>
    </div>
  );
}
