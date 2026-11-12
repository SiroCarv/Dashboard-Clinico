// Formularios cuyo último cambio de estado (habilitar o deshabilitar) lo
// hizo la pasante, de más reciente a más antiguo. Es la parte del trabajo
// de campo que la base atribuye a una persona concreta (ver
// supervisionPasantiasService.formulariosHabilitados). Solo lectura.
import { ETIQUETA_INSTRUMENTO } from '../data/etiquetasInstrumento';
import { formatearFechaHora } from '../utils/formatoFecha';

export function TablaFormulariosHabilitados({ habilitaciones }) {
  if (habilitaciones.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">Esta pasante todavía no ha habilitado formularios.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-gray-200">Formulario</th>
              <th className="p-4 font-bold border-b border-gray-200">Institución</th>
              <th className="p-4 font-bold border-b border-gray-200">Estado</th>
              <th className="p-4 font-bold border-b border-gray-200">Último cambio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {habilitaciones.map((fila) => (
              <tr
                key={`${fila.institucion}-${fila.tipoInstrumento}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 text-gray-800 font-medium">
                  {ETIQUETA_INSTRUMENTO[fila.tipoInstrumento] || fila.tipoInstrumento}
                </td>
                <td className="p-4 text-gray-600">{fila.institucion || '—'}</td>
                <td className="p-4">
                  {fila.habilitado ? (
                    <span className="inline-block px-2 py-0.5 bg-green-100 border border-green-300 text-green-800 rounded-full text-xs font-bold">
                      Habilitado
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-bold">
                      Deshabilitado
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{formatearFechaHora(fila.actualizadoEn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
