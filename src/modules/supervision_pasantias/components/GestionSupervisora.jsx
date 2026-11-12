// Contenido de la pestaña "Supervisora" del Panel Maestro (superadmin).
// Dos bloques: (1) la cuenta ÚNICA de Docente Supervisora —crearla si no
// existe, editarla si existe— y (2) la selección de pasantes a su cargo.
//
// No hay botón de eliminar a propósito: la cuenta es única y guarda el
// historial de calificaciones. Si cambia la persona, se edita la misma
// cuenta con otro nombre, correo y contraseña (ver SupervisoraModal).
//
// Alta y edición pasan siempre por cuentaSupervisoraService (Edge
// Functions con service_role); acá nunca se escribe en `usuarios` directo.
import { useEffect, useState } from 'react';
import { cuentaSupervisoraService } from '../services/cuentaSupervisoraService';
import { SupervisoraModal } from './SupervisoraModal';
import { SeleccionPasantes } from './SeleccionPasantes';
import { formatearFecha } from '../utils/formatoFecha';

export const GestionSupervisora = () => {
  const [cuenta, setCuenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recargarCuenta = async () => {
    try {
      setCuenta(await cuentaSupervisoraService.obtenerCuenta());
    } catch (err) {
      console.error('Error cargando la cuenta de la supervisora:', err.message);
      setError('No se pudo cargar la cuenta de la Docente Supervisora.');
    }
  };

  // Carga inicial: la bandera "activo" evita actualizar estado si el
  // componente se desmonta (cambio de pestaña) antes de que responda.
  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const data = await cuentaSupervisoraService.obtenerCuenta();
        if (activo) setCuenta(data);
      } catch (err) {
        console.error('Error cargando la cuenta de la supervisora:', err.message);
        if (activo) setError('No se pudo cargar la cuenta de la Docente Supervisora.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarInicial();
    return () => {
      activo = false;
    };
  }, []);

  // Si falla, el error se propaga al modal (que lo muestra y queda
  // abierto); solo se cierra y recarga cuando el guardado salió bien.
  const handleSave = async ({ nombre, correo, password }) => {
    if (cuenta) {
      await cuentaSupervisoraService.editar(cuenta.id, { nombre, correo, passwordNueva: password });
    } else {
      await cuentaSupervisoraService.crear({ nombre, correo, passwordTemporal: password });
    }
    await recargarCuenta();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-black">Docente Supervisora</h2>
            <p className="text-xs text-gray-700 font-medium">
              Cuenta única: revisa y califica el trabajo de las estudiantes en pasantía. No se puede crear más de una.
            </p>
          </div>
          {!loading && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-violet-400 hover:bg-orange-800 text-white font-bold uppercase tracking-wide text-sm px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span>{cuenta ? 'Editar cuenta' : '+ Crear cuenta'}</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 flex justify-center items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span className="text-sm text-gray-500 font-medium">Sincronizando registros...</span>
            </div>
          ) : cuenta ? (
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre</p>
                <p className="font-semibold text-gray-800">
                  {cuenta.nombre || <span className="text-gray-400 italic font-normal">Sin nombre registrado</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Correo</p>
                <p className="text-gray-800 break-all">{cuenta.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha alta</p>
                <p className="text-gray-800">{formatearFecha(cuenta.created_at)}</p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center bg-gray-50">
              <p className="text-gray-500 text-base font-bold">Aún no se creó la cuenta de la Docente Supervisora</p>
              <p className="text-xs text-gray-400 mt-1">Crea la cuenta para que pueda ingresar a su panel.</p>
            </div>
          )}
        </div>
      </div>

      <SeleccionPasantes />

      <SupervisoraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        cuentaEditada={cuenta}
      />
    </div>
  );
};
