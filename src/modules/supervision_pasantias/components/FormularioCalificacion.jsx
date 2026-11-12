// Formulario para registrar una calificación (0 a 100) con una observación
// obligatoria. Como cada calificación queda guardada para siempre (la base
// no permite editarla ni borrarla), el envío tiene DOS pasos: "Registrar"
// muestra un resumen y el botón "Confirmar y guardar" recién ahí la envía.
// Se usa un paso en la propia tarjeta y no ModalConfirmacion porque ese
// modal tiene el botón de confirmar en rojo, color reservado a severidad
// clínica en esta plataforma.
//
// `onGuardar` lanza si algo falla; el error se muestra acá mismo y se
// conserva lo escrito para poder reintentar.
import { useState } from 'react';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';

const NOTA_MINIMA = 0;
const NOTA_MAXIMA = 100;
const LONGITUD_MAXIMA_OBSERVACION = 2000;

export function FormularioCalificacion({ onGuardar }) {
  const [nota, setNota] = useState('');
  const [observacion, setObservacion] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const notaNumero = nota === '' ? NaN : Number(nota);
  const notaValida = Number.isInteger(notaNumero) && notaNumero >= NOTA_MINIMA && notaNumero <= NOTA_MAXIMA;
  const observacionLimpia = observacion.trim();
  const observacionValida = observacionLimpia.length > 0 && observacionLimpia.length <= LONGITUD_MAXIMA_OBSERVACION;
  const puedeContinuar = notaValida && observacionValida;

  const pedirConfirmacion = (e) => {
    e.preventDefault();
    setError('');
    setExito(false);
    if (puedeContinuar) setConfirmando(true);
  };

  const guardar = async () => {
    setGuardando(true);
    setError('');
    try {
      await onGuardar({ nota: notaNumero, observacion: observacionLimpia });
      setNota('');
      setObservacion('');
      setConfirmando(false);
      setExito(true);
    } catch (err) {
      console.error('Error al registrar la calificación:', err.message);
      setError('No se pudo registrar la calificación. Intenta de nuevo.');
      setConfirmando(false);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl border-t-8 ${COLOR_MARCA.violetaSuave.franja} p-6`}>
      <h3 className="text-lg font-extrabold text-black">Registrar calificación</h3>
      <p className="text-xs text-gray-600 font-medium mt-1 mb-4">
        Cada calificación queda en el historial y no se puede modificar ni eliminar.
      </p>

      {exito && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-center text-sm font-semibold">
          Calificación registrada.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
          {error}
        </div>
      )}

      {confirmando ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Nota</p>
            <p className="text-3xl font-extrabold text-black">
              {notaNumero} <span className="text-base font-semibold text-gray-500">/ {NOTA_MAXIMA}</span>
            </p>
            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider mt-3">Observación</p>
            <p className="text-gray-800 whitespace-pre-wrap">{observacionLimpia}</p>
          </div>
          <p className="text-sm text-gray-700 font-semibold">
            ¿Confirmas el registro? Una vez guardada, la calificación no se puede cambiar.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={guardando}
              className="px-6 py-3 rounded-md text-gray-600 hover:bg-gray-100 font-bold transition-colors disabled:opacity-50"
            >
              Volver a editar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className={`px-6 py-3 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors duration-300 flex justify-center items-center ${
                guardando ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-violet-400 hover:bg-orange-800 text-white'
              }`}
            >
              {guardando ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Guardando...
                </span>
              ) : (
                'Confirmar y guardar'
              )}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={pedirConfirmacion} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mb-1">Nota (0 a {NOTA_MAXIMA})</label>
            <input
              type="number"
              inputMode="numeric"
              min={NOTA_MINIMA}
              max={NOTA_MAXIMA}
              step="1"
              required
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
              placeholder="Ej. 85"
            />
            {nota !== '' && !notaValida && (
              <p className="text-red-500 text-xs mt-1 font-semibold">
                La nota debe ser un número entero entre {NOTA_MINIMA} y {NOTA_MAXIMA}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">Observación</label>
            <textarea
              required
              rows={4}
              maxLength={LONGITUD_MAXIMA_OBSERVACION}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
              placeholder="Retroalimentación sobre el trabajo de campo y las evaluaciones aplicadas"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {observacion.length} / {LONGITUD_MAXIMA_OBSERVACION}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!puedeContinuar}
              className={`px-6 py-3 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors duration-300 ${
                puedeContinuar ? 'bg-violet-400 hover:bg-orange-800 text-white' : 'bg-gray-400 cursor-not-allowed text-white'
              }`}
            >
              Registrar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
