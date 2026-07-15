function formatearFecha(fechaIso) {
  if (!fechaIso) return null;
  return new Date(fechaIso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function EvaluacionYaRealizada({ fecha }) {
  const fechaFormateada = formatearFecha(fecha);

  return (
    <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl text-center">
      <div className="mb-4 p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-sm font-bold">
        ✅ Ya completaste tu evaluación
      </div>
      <h2 className="text-2xl font-extrabold text-black mb-2">Gracias por participar</h2>
      <p className="text-gray-500 font-medium">
        {fechaFormateada
          ? `Respondiste tu evaluación el ${fechaFormateada}. `
          : 'Ya registramos tu evaluación. '}
        Tu psicólogo(a) ya tiene acceso a tus respuestas.
      </p>
      <p className="text-gray-500 font-medium mt-2">
        Puedes cerrar sesión desde la barra superior.
      </p>
    </div>
  );
}