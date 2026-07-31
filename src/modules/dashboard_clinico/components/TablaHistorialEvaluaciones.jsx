import { useNavigate } from 'react-router-dom';
import { ESTILOS_DIAGNOSTICO, FILA_ALERTA_ACTIVADA } from '../../../shared/theme/paletaColores';
import {
  obtenerEtiquetaIdentidad,
  obtenerNombreMostrado,
  obtenerEstiloEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TablaHistorialEvaluaciones({ evaluaciones, hayFiltrosActivos = false }) {
  const navigate = useNavigate();

  // Historia "Visualización de Detalle Clínico" (SCRUM-21): clic en una
  // fila lleva a la vista de detalle de esa evaluación puntual.
  const irADetalle = (idEvaluacion) => navigate(`/dashboard/evaluacion/${idEvaluacion}`);

  if (evaluaciones.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">
          {hayFiltrosActivos
            ? 'No se encontraron participantes ni consultantes con estos criterios.'
            : 'No hay evaluaciones registradas aún.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-gray-200">ID</th>
              <th className="p-4 font-bold border-b border-gray-200">Participante / Consultante</th>
              <th className="p-4 font-bold border-b border-gray-200">Institución</th>
              <th className="p-4 font-bold border-b border-gray-200">Fecha</th>
              <th className="p-4 font-bold border-b border-gray-200 text-center">Puntaje</th>
              <th className="p-4 font-bold border-b border-gray-200">Diagnóstico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {evaluaciones.map((ev) => {
              const etiquetaIdentidad = obtenerEtiquetaIdentidad(ev.paciente);

              return (
                <tr
                  key={ev.id_evaluacion}
                  onClick={() => irADetalle(ev.id_evaluacion)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      irADetalle(ev.id_evaluacion);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`cursor-pointer transition-colors ${
                    ev.alerta_activada ? FILA_ALERTA_ACTIVADA : 'hover:bg-gray-50'
                  }`}
                >
                  <td
                    className="p-4 text-gray-500 font-mono text-xs"
                    title={ev.id_evaluacion}
                  >
                    {ev.id_evaluacion.slice(0, 8)}
                  </td>
                  <td className="p-4 text-gray-800 font-medium">
                    <span
                      className={`inline-block px-2 py-0.5 mr-2 border rounded-full text-xs font-semibold align-middle ${obtenerEstiloEtiquetaIdentidad(
                        etiquetaIdentidad
                      )}`}
                    >
                      {etiquetaIdentidad}
                    </span>
                    <span className="align-middle">{obtenerNombreMostrado(ev.paciente)}</span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {ev.paciente?.institucion?.nombre || '—'}
                  </td>
                  <td className="p-4 text-gray-600">{formatearFecha(ev.fecha_registro)}</td>
                  <td className="p-4 text-center text-gray-800 font-mono font-semibold">
                    {ev.puntaje_total}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 border rounded-full text-sm font-semibold ${
                        ESTILOS_DIAGNOSTICO[ev.diagnostico] || 'bg-gray-100 border-gray-300 text-gray-800'
                      }`}
                    >
                      {ev.alerta_activada ? '⚠️ ' : ''}
                      {ev.diagnostico}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}