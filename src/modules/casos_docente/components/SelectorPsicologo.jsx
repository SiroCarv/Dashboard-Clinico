export default function SelectorPsicologo({ psicologos, cargando, psicologoId, onCambiar }) {
  if (cargando) {
    return <p className="text-gray-500 text-center py-8">Cargando psicólogos de tu institución...</p>;
  }

  if (psicologos.length === 0) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 text-gray-600 rounded-md text-center">
        Tu institución todavía no tiene un psicólogo asignado. Contacta a la administración.
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-bold text-black mb-1">¿Quién revisará este caso?</label>
      <select
        value={psicologoId ?? ''}
        onChange={(e) => onCambiar(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
      >
        <option value="" disabled>
          Selecciona un psicólogo...
        </option>
        {psicologos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}