// Contenido de la pestaña "Jefes de Centro" del Panel Maestro: tabla de
// cuentas con rol 'jefe_centro' y las acciones de crear/editar/eliminar.
// Mismo patrón visual que AsignacionPsicologos (módulo `instituciones`):
// barra de acciones arriba, tabla con franja violeta, confirmación de
// borrado con ModalConfirmacion.
//
// Recibe `instituciones` (la lista completa que ya carga PanelMaestro) y
// se queda solo con las de tipo Centro de Salud: un/a jefe/a únicamente
// puede pertenecer a un centro de salud (regla que además valida la Edge
// Function). Este módulo no importa nada del módulo `instituciones` — el
// dato llega por props, y 'centro_salud' es el mismo valor que guarda la
// columna `instituciones.tipo_institucion`.
//
// Cuenta sin centro: si el centro de un/a jefe/a se elimina, la base deja
// su `institucion_id` en NULL (no se borra la cuenta). La tabla lo marca
// con "Sin centro asignado" y editar la cuenta obliga a elegir uno.
//
// Las altas/ediciones/bajas pasan siempre por jefesCentroService (Edge
// Functions con service_role); acá nunca se escribe en `usuarios` directo.
import { useState, useEffect, useMemo } from 'react';
import { jefesCentroService } from '../services/jefesCentroService';
import { JefeCentroModal } from './JefeCentroModal';
import { ModalConfirmacion } from '../../../shared/components/ModalConfirmacion';

const TIPO_CENTRO_SALUD = 'centro_salud';

const formatearFecha = (fechaString) => {
  if (!fechaString) return '-';
  return new Date(fechaString).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const GestionJefesCentro = ({ instituciones }) => {
  const [jefes, setJefes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jefeEnEdicion, setJefeEnEdicion] = useState(null);
  const [jefeAEliminar, setJefeAEliminar] = useState(null);

  const centros = useMemo(
    () => instituciones.filter((i) => i.tipo_institucion === TIPO_CENTRO_SALUD),
    [instituciones]
  );

  const nombrePorCentro = useMemo(() => new Map(centros.map((c) => [c.id, c.nombre])), [centros]);

  // Centros que ya tienen un/a jefe/a, EXCEPTO el de la cuenta que se está
  // editando (su propio centro debe seguir siendo elegible).
  const centrosOcupados = useMemo(
    () =>
      new Set(
        jefes
          .filter((j) => j.institucion_id && j.id !== jefeEnEdicion?.id)
          .map((j) => j.institucion_id)
      ),
    [jefes, jefeEnEdicion]
  );

  const cargarJefes = async () => {
    try {
      setLoading(true);
      setError(null);
      setJefes(await jefesCentroService.listar());
    } catch (err) {
      console.error('Error cargando jefes de centro:', err);
      setError('No se pudieron cargar las cuentas de jefe/a de centro.');
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial: la bandera "activo" evita actualizar estado si el
  // componente se desmonta (cambio de pestaña) antes de que responda.
  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const data = await jefesCentroService.listar();
        if (activo) setJefes(data);
      } catch (err) {
        console.error('Error cargando jefes de centro:', err);
        if (activo) setError('No se pudieron cargar las cuentas de jefe/a de centro.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarInicial();
    return () => {
      activo = false;
    };
  }, []);

  const handleOpenModal = (jefe = null) => {
    setJefeEnEdicion(jefe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setJefeEnEdicion(null);
  };

  // Si falla, el error se propaga al modal (que lo muestra y queda
  // abierto); solo se cierra y recarga cuando el guardado salió bien.
  const handleSave = async (datos) => {
    if (jefeEnEdicion) {
      await jefesCentroService.editar(jefeEnEdicion.id, datos);
    } else {
      await jefesCentroService.crear(datos);
    }
    await cargarJefes();
    handleCloseModal();
  };

  const confirmarEliminar = async () => {
    try {
      await jefesCentroService.eliminar(jefeAEliminar.id);
      await cargarJefes();
    } catch (err) {
      console.error(err);
      setError(err.message || 'No se pudo eliminar la cuenta.');
    } finally {
      setJefeAEliminar(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-black">Jefes/as de Centro de Salud</h2>
          <p className="text-xs text-gray-700 font-medium">
            Cuentas de supervisión: ven a todo el equipo de psicólogos/as y a las personas de su centro.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={centros.length === 0}
          className="bg-violet-400 hover:bg-orange-800 text-white font-bold uppercase tracking-wide text-sm px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 flex items-center justify-center gap-2 self-start sm:self-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span>+ Agregar Jefe/a de Centro</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Usuario / Correo
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Centro de Salud
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Fecha Alta
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span className="text-sm text-gray-500 font-medium">Sincronizando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : jefes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-sm font-medium text-gray-400 bg-gray-50">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-gray-500 text-base font-bold">No hay jefes/as de centro registrados/as</p>
                      <p className="text-xs text-gray-400">
                        {centros.length === 0
                          ? 'Primero crea un Centro de Salud en la pestaña Instituciones.'
                          : 'Agrega una cuenta para que un/a jefe/a pueda supervisar su centro.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                jefes.map((jefe) => (
                  <tr key={jefe.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-semibold text-gray-800">
                        {jefe.nombre || <span className="text-gray-400 italic font-normal">Sin nombre registrado</span>}
                      </div>
                      <div className="text-xs text-gray-500">{jefe.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {nombrePorCentro.get(jefe.institucion_id) || (
                        <span className="text-red-500 font-semibold">Sin centro asignado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(jefe.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => handleOpenModal(jefe)}
                          className="text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setJefeAEliminar(jefe)}
                          className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <JefeCentroModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        jefeEditado={jefeEnEdicion}
        centros={centros}
        centrosOcupados={centrosOcupados}
      />

      <ModalConfirmacion
        isOpen={!!jefeAEliminar}
        titulo="¿Eliminar esta cuenta?"
        mensaje={
          jefeAEliminar
            ? `Se eliminará permanentemente la cuenta de ${jefeAEliminar.email}. El centro de salud y su equipo no se ven afectados. Esta acción no se puede deshacer.`
            : ''
        }
        onConfirm={confirmarEliminar}
        onCancel={() => setJefeAEliminar(null)}
      />
    </div>
  );
};
