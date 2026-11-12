// Cabecera del detalle de una pasante: sus datos básicos, las tarjetas de
// totales y la tabla de evaluaciones por tipo de formulario. Solo muestra;
// los datos llegan ya listos desde useDetallePasante.
//
// Los totales salen de `instrumentos` (evaluaciones de las instituciones de
// la pasante, ver supervisionPasantiasService) y de `personas`, así la
// cabecera y las tablas de abajo nunca discrepan entre sí.
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { ETIQUETA_TURNO_PSICOLOGO } from '../../psicologos';
import { ETIQUETA_INSTRUMENTO } from '../data/etiquetasInstrumento';
import { formatearFecha } from '../utils/formatoFecha';

function Tarjeta({ titulo, valor }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-t-4 ${COLOR_MARCA.violetaSuave.franja} p-4 text-center`}>
      <p className="text-3xl font-extrabold text-black">{valor}</p>
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">{titulo}</p>
    </div>
  );
}

export function ResumenPasante({ pasante, instrumentos, personas, habilitaciones }) {
  const totalEvaluaciones = instrumentos.reduce((suma, i) => suma + i.totalEvaluaciones, 0);
  const totalAlertas = instrumentos.reduce((suma, i) => suma + i.evaluacionesConAlerta, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-black">{pasante.nombre || 'Sin nombre registrado'}</h2>
        <p className="text-gray-700 mt-1 font-semibold">
          {[ETIQUETA_TURNO_PSICOLOGO[pasante.turno], pasante.email].filter(Boolean).join(' · ')}
        </p>
        <p className="text-gray-600 text-sm mt-1">
          {pasante.instituciones.length > 0
            ? pasante.instituciones.map((i) => i.nombre).join(', ')
            : 'Sin institución asignada'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Tarjeta titulo="Personas" valor={personas.length} />
        <Tarjeta titulo="Evaluaciones" valor={totalEvaluaciones} />
        <Tarjeta titulo="Con alerta" valor={totalAlertas} />
        <Tarjeta titulo="Formularios habilitados" valor={habilitaciones.length} />
      </div>

      {instrumentos.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Todavía no hay evaluaciones registradas en sus instituciones.</p>
        </div>
      ) : (
        <div className={`bg-white rounded-lg shadow-xl border-t-8 ${COLOR_MARCA.violetaSuave.franja} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-gray-200">Formulario</th>
                  <th className="p-4 font-bold border-b border-gray-200 text-center">Evaluaciones</th>
                  <th className="p-4 font-bold border-b border-gray-200 text-center">Con alerta</th>
                  <th className="p-4 font-bold border-b border-gray-200">Última aplicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {instrumentos.map((fila) => (
                  <tr key={fila.tipoInstrumento} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">
                      {ETIQUETA_INSTRUMENTO[fila.tipoInstrumento] || fila.tipoInstrumento}
                    </td>
                    <td className="p-4 text-gray-800 text-center">{fila.totalEvaluaciones}</td>
                    <td className="p-4 text-center">
                      {fila.evaluacionesConAlerta > 0 ? (
                        <span className="inline-block px-2 py-0.5 bg-red-100 border border-red-300 text-red-800 rounded-full text-xs font-bold">
                          {fila.evaluacionesConAlerta}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{formatearFecha(fila.ultimaEvaluacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
