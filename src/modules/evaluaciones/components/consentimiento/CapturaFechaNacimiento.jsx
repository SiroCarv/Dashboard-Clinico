// Primer paso obligatorio del flujo de consentimiento (ver
// useConsentimiento.js): pide la fecha de nacimiento porque es el único
// dato que permite calcular la edad y decidir qué documento legal
// mostrar después. Una vez guardada, la RPC `registrar_fecha_nacimiento`
// no permite sobrescribirla (ver consentimientoService.js) — por eso el
// input no tiene forma de "editar después" en esta pantalla.
import { useState } from 'react';

export default function CapturaFechaNacimiento({ onConfirmar }) {
  const [fecha, setFecha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const hoyISO = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha) return;
    setError('');
    setEnviando(true);
    try {
      await onConfirmar(fecha);
    } catch (err) {
      console.error('Error al registrar fecha de nacimiento:', err.message);
      setError('No se pudo guardar tu fecha de nacimiento. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-black">Antes de continuar</h2>
        <p className="text-gray-500 mt-2 font-medium">
          Necesitamos tu fecha de nacimiento para mostrarte el documento de autorización que
          corresponde.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-black mb-1" htmlFor="fecha-nacimiento">
            Fecha de nacimiento
          </label>
          <input
            id="fecha-nacimiento"
            type="date"
            value={fecha}
            max={hoyISO}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          />
          <p className="text-xs text-gray-400 mt-1">Esta fecha no podrá modificarse después.</p>
        </div>

        <button
          type="submit"
          disabled={!fecha || enviando}
          className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
            !fecha || enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-400 hover:bg-orange-800'
          }`}
        >
          {enviando ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </form>
    </div>
  );
}
