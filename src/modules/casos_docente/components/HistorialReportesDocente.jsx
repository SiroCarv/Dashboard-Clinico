// Lista de solo lectura de los reportes que el docente autenticado ya
// envió -- "evidencia de su trabajo" (criterio de aceptación), nunca
// editable: no hay ningún control de edición/borrado a propósito, ni del
// lado del cliente ni del servidor (ver policies de reportes_docente).
export default function HistorialReportesDocente({ reportes, cargando }) {
  if (cargando) {
    return <p className="text-gray-500 text-center py-6">Cargando tus reportes...</p>;
  }

  if (reportes.length === 0) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 text-gray-600 rounded-md text-center">
        Todavía no enviaste ningún reporte.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reportes.map((r) => (
        <div key={r.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <p className="font-bold text-black">
              {r.nombre_alumno} {r.apellido_alumno}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(r.fecha_registro).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-3">{[r.curso, r.paralelo, r.turno].filter(Boolean).join(' · ')}</p>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{r.descripcion}</p>
        </div>
      ))}
    </div>
  );
}