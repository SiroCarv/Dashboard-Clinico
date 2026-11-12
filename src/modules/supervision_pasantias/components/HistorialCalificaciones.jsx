// Historial de calificaciones de la pasante, de la más reciente a la más
// antigua, con el promedio arriba. Solo lectura: las calificaciones no se
// editan ni se eliminan (ver FormularioCalificacion).
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { formatearFechaHora } from '../utils/formatoFecha';

export function HistorialCalificaciones({ calificaciones }) {
  if (calificaciones.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">Esta pasante aún no tiene calificaciones.</p>
      </div>
    );
  }

  const promedio = calificaciones.reduce((suma, c) => suma + c.nota, 0) / calificaciones.length;

  return (
    <div className={`bg-white rounded-lg shadow-xl border-t-8 ${COLOR_MARCA.violetaSuave.franja} overflow-hidden`}>
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <h3 className="text-lg font-extrabold text-black">Historial de calificaciones</h3>
        <span className="text-sm text-gray-700 font-semibold">
          Promedio: <span className="font-extrabold text-black">{promedio.toFixed(1)}</span> ({calificaciones.length}{' '}
          {calificaciones.length === 1 ? 'calificación' : 'calificaciones'})
        </span>
      </div>
      <ul className="divide-y divide-gray-100">
        {calificaciones.map((c) => (
          <li key={c.id} className="p-4 flex gap-4">
            <div className="shrink-0 w-16 text-center">
              <p className="text-2xl font-extrabold text-black">{c.nota}</p>
              <p className="text-xs text-gray-500 font-semibold">/ 100</p>
            </div>
            <div className="min-w-0">
              <p className="text-gray-800 whitespace-pre-wrap break-words">{c.observacion}</p>
              <p className="text-xs text-gray-500 mt-1">{formatearFechaHora(c.fecha_registro)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
