import { useState, useMemo } from 'react';

export const InstitucionList = ({ instituciones, onEdit, onDelete }) => {
  const [copiadoId, setCopiadoId] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const copiarEnlace = async (inst) => {
    const enlace = `${window.location.origin}/registro/${inst.codigo_registro}`;
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiadoId(inst.id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err);
    }
  };

  const hayBusquedaActiva = terminoBusqueda.trim().length > 0;

  const institucionesFiltradas = useMemo(() => {
    const termino = terminoBusqueda.trim().toLowerCase();
    if (!termino) return instituciones;
    return instituciones.filter((inst) => {
      const nombre = (inst.nombre || '').toLowerCase();
      const codigo = (inst.codigo_registro || '').toLowerCase();
      return nombre.includes(termino) || codigo.includes(termino);
    });
  }, [instituciones, terminoBusqueda]);

  const limpiarFiltros = () => setTerminoBusqueda('');

  return (
    <div className="space-y-6">
      {/* Barra de acciones superior idéntica a Psicólogos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-black">Instituciones Registradas</h2>
          <p className="text-xs text-gray-500">Administra los centros educativos y sus códigos de acceso institucional.</p>
        </div>
        <button
          onClick={() => onEdit()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wide text-sm px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+ Nueva Institución</span>
        </button>
      </div>

      {/* Barra de búsqueda: solo se muestra si existe al menos una institución registrada (AC4) */}
      {instituciones.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          <input
            type="text"
            aria-label="Buscar instituciones por nombre o código de registro"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por nombre o código de registro..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
          />
          <button
            onClick={limpiarFiltros}
            disabled={!hayBusquedaActiva}
            className="text-sm font-bold uppercase tracking-wide px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 whitespace-nowrap bg-gray-400 text-white disabled:bg-gray-300 disabled:cursor-not-allowed enabled:bg-orange-500 enabled:hover:bg-orange-600"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {instituciones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No hay instituciones registradas aún.</p>
        </div>
      ) : institucionesFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No se encontraron instituciones con estos criterios.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-gray-200">Nombre</th>
                  <th className="p-4 font-bold border-b border-gray-200">Código de Acceso</th>
                  <th className="p-4 font-bold border-b border-gray-200 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {institucionesFiltradas.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{inst.nombre}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-full text-sm font-mono font-semibold">
                        {inst.codigo_registro}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-4">
                      <button
                        onClick={() => copiarEnlace(inst)}
                        className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        {copiadoId === inst.id ? '¡Copiado!' : 'Copiar Enlace'}
                      </button>
                      <button
                        onClick={() => onEdit(inst)}
                        className="text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(inst.id)}
                        className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};