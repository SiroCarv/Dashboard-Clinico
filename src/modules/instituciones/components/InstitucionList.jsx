import { useState } from 'react';

export const InstitucionList = ({ instituciones, onEdit, onDelete }) => {
  const [copiadoId, setCopiadoId] = useState(null);

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

  if (instituciones.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">No hay instituciones registradas aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-gray-200">Nombre</th>
              <th className="p-4 font-semibold border-b border-gray-200">Código de Acceso</th>
              <th className="p-4 font-semibold border-b border-gray-200 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {instituciones.map((inst) => (
              <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-800 font-medium">{inst.nombre}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-900 rounded-full text-sm font-mono font-semibold">
                    {inst.codigo_registro}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => copiarEnlace(inst)}
                    className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                  >
                    {copiadoId === inst.id ? '¡Copiado!' : 'Copiar Enlace'}
                  </button>
                  <button
                    onClick={() => onEdit(inst)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(inst.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
  );
};