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
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-black">
              {institucionEditada ? 'Editar Institución' : 'Nueva Institución'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Nombre de la Institución
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
                placeholder="Ej. Colegio San Agustín"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Código de Registro (Enlace Único)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoRegistro}
                  onChange={(e) => setCodigoRegistro(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800 font-mono"
                  placeholder="Ej. UNI-XXXX"
                />
                <button
                  type="button"
                  onClick={generarCodigo}
                  className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors text-sm font-bold shadow-md whitespace-nowrap"
                >
                  Generar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este código será usado por los pacientes para auto-registrarse.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-md text-gray-600 hover:bg-gray-100 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors duration-300 flex justify-center items-center ${
                  loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Guardando...
                  </span>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};