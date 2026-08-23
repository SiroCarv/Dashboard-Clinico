export default function SelectorAlumno({ alumnos, cargando, onSeleccionar }) {
  if (cargando) {
    return <p className="text-gray-500 text-center py-8">Cargando alumnos de tu institución...</p>;
  }

  if (alumnos.length === 0) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 text-gray-600 rounded-md text-center">
        Todavía no hay alumnos registrados en tu institución.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
      <h3 className="text-lg font-extrabold text-black mb-1">Registrar un nuevo caso</h3>
      <p className="text-gray-500 text-sm mb-4">Elige al alumno por el que te preocupa.</p>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alumnos.map((alumno) => (
          <button
            key={alumno.id}
            type="button"
            onClick={() => onSeleccionar(alumno)}
            className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:border-violet-400 hover:bg-violet-50 transition-colors"
          >
            <p className="font-bold text-black">{alumno.nombre}</p>
            <p className="text-sm text-gray-500">
              {[alumno.curso, alumno.paralelo, alumno.turno].filter(Boolean).join(' · ') || 'Sin datos de curso'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}