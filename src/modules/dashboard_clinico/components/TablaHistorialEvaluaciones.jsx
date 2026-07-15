const ESTILOS_DIAGNOSTICO = {
  Leve: 'bg-green-50 border-green-200 text-green-800',
  Moderado: 'bg-gray-100 border-gray-300 text-gray-800',
  Severo: 'bg-red-50 border-red-200 text-red-800',
};

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TablaHistorialEvaluaciones({ evaluaciones }) {
  if (evaluaciones.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">No hay evaluaciones registradas aún.</p>
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
              <th className="p-4 font-bold border-b border-gray-200">Paciente</th>
              <th className="p-4 font-bold border-b border-gray-200">Institución</th>
              <th className="p-4 font-bold border-b border-gray-200">Fecha</th>
              <th className="p-4 font-bold border-b border-gray-200 text-center">Puntaje</th>
              <th className="p-4 font-bold border-b border-gray-200">Diagnóstico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {evaluaciones.map((ev) => (
              <tr key={ev.id_evaluacion} className="hover:bg-gray-50 transition-colors">
                <td
                  className="p-4 text-gray-500 font-mono text-xs"
                  title={ev.id_evaluacion}
                >
                  {ev.id_evaluacion.slice(0, 8)}
                </td>
                <td className="p-4 text-gray-800 font-medium">
                  {ev.paciente?.nombre || ev.paciente?.email || 'Paciente desconocido'}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}