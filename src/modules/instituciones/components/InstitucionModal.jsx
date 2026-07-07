import { useState, useEffect } from 'react';

export const InstitucionModal = ({ isOpen, onClose, onSave, institucionEditada }) => {
  const [nombre, setNombre] = useState('');
  const [codigoRegistro, setCodigoRegistro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institucionEditada) {
      setNombre(institucionEditada.nombre || '');
      setCodigoRegistro(institucionEditada.codigo_registro || '');
    } else {
      setNombre('');
      setCodigoRegistro('');
    }
  }, [institucionEditada, isOpen]);

  const generarCodigo = () => {
    // Genera un código único tipo "UNI-4A9B"
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    setCodigoRegistro(`UNI-${randomStr}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ nombre, codigo_registro: codigoRegistro });
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-t-4 border-orange-500 overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {institucionEditada ? 'Editar Institución' : 'Nueva Institución'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Institución
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-800"
                placeholder="Ej. Colegio San Agustín"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código de Registro (Enlace Único)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoRegistro}
                  onChange={(e) => setCodigoRegistro(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-800 font-mono"
                  placeholder="Ej. UNI-XXXX"
                />
                <button
                  type="button"
                  onClick={generarCodigo}
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium shadow-md"
                >
                  Generar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este código será usado por los pacientes para auto-registrarse.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-md shadow-orange-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};