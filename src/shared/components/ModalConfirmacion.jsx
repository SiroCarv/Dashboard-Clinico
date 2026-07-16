import { useState } from 'react';

/**
 * Modal de confirmación genérico para acciones destructivas o irreversibles
 * (eliminar una institución, un psicólogo, etc.). Reemplaza el uso de
 * `window.confirm()` para mantener la consistencia visual del resto de la
 * app: misma tarjeta con franja naranja, mismos botones, mismo spinner.
 *
 * Vive en `shared/` porque no pertenece a ningún dominio en particular —
 * cualquier módulo puede necesitar confirmar una acción destructiva.
 *
 * Uso típico:
 *   const [aEliminar, setAEliminar] = useState(null);
 *
 *   <ModalConfirmacion
 *     isOpen={!!aEliminar}
 *     titulo="¿Eliminar esta institución?"
 *     mensaje={`Esta acción no se puede deshacer.`}
 *     onConfirm={async () => { await eliminar(aEliminar.id); setAEliminar(null); }}
 *     onCancel={() => setAEliminar(null)}
 *   />
 */
export const ModalConfirmacion = ({
  isOpen,
  titulo = '¿Estás seguro?',
  mensaje,
  textoConfirmar = 'Eliminar',
  textoCargando = 'Eliminando...',
  onConfirm,
  onCancel,
}) => {
  const [procesando, setProcesando] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setProcesando(true);
    try {
      await onConfirm();
    } finally {
      // Si onConfirm cierra el modal (isOpen pasa a false) este componente
      // se desmonta y este setState ya no importa; si onConfirm falla y el
      // modal se mantiene abierto, esto libera el botón para reintentar.
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-black">{titulo}</h2>
            {mensaje && <p className="text-gray-500 mt-2 font-medium">{mensaje}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={procesando}
              className="px-6 py-3 rounded-md text-gray-600 hover:bg-gray-100 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={procesando}
              className={`px-6 py-3 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors duration-300 flex justify-center items-center text-white ${
                procesando ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {procesando ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {textoCargando}
                </span>
              ) : (
                textoConfirmar
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};