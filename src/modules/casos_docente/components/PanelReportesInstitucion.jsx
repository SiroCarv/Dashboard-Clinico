// Pestaña "Reportes" del panel del psicólogo: lista los reportes que
// enviaron los docentes de su institución, identificando quién los
// redactó y qué problema presenta el alumno -- criterio de aceptación
// explícito. Mismo estilo de tarjeta que HistorialReportesDocente.jsx
// (vista del propio docente), para que ambas listas se sientan como la
// misma pieza de UI vista desde dos roles distintos.
export default function PanelReportesInstitucion({ reportes, cargando, error }) {
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">{error}</div>
    );
  }

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span className="text-gray-700 font-semibold">Cargando reportes...</span>
      </div>
    );
  }

  if (reportes.length === 0) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 text-gray-600 rounded-md text-center">
        Todavía no hay reportes de docentes en tu institución.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reportes.map((r) => (
        <div key={r.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <p className="font-bold text-black">
              {r.nombre_alumno} {r.apellido_alumno}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(r.fecha_registro).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-2">{[r.curso, r.paralelo, r.turno].filter(Boolean).join(' · ')}</p>
          <p className="text-xs font-semibold text-violet-600 mb-3">Reportado por: {r.docente?.email ?? 'Docente'}</p>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{r.descripcion}</p>
        </div>
      ))}
    </div>
  );
}