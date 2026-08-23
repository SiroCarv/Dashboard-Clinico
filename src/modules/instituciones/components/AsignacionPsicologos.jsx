// Pestaña "Psicólogos" del Panel Maestro: tabla de cuentas con rol
// 'psicologo', un selector único de institución por fila (desde SCRUM
// "Psicólogo en una sola institución" un psicólogo ya no puede estar en
// más de una a la vez — restricción UNIQUE(psicologo_id) en la base), y
// las acciones de crear/editar/eliminar la cuenta en sí.
//
// La creación/edición/eliminación real de la CUENTA (Supabase Auth +
// fila en `usuarios`) pasa por `psicologosService`, que a su vez invoca
// las Edge Functions con service_role — nunca se hace directo desde acá
// con el cliente anónimo, porque eso invalidaría la sesión del
// superadmin que está operando. La ASIGNACIÓN a la institución sí es
// directa contra `psicologo_institucion` vía `psicologoInstitucionService`
// (no requiere privilegios especiales, solo RLS de superadmin).
//
// Importa PsicologoModal y psicologosService desde la API pública del
// módulo `psicologos` (nunca una ruta interna) — es la única forma de
// consumo cruzado entre módulos que permite la arquitectura del
// proyecto.
import { useState, useEffect, useMemo } from 'react';
import { psicologoInstitucionService } from '../services/psicologoInstitucionService';
import { PsicologoModal, psicologosService } from '../../psicologos';
import { ModalConfirmacion } from '../../../shared/components/ModalConfirmacion';

export const AsignacionPsicologos = ({ instituciones }) => {
  const [psicologos, setPsicologos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [psicologoEnEdicion, setPsicologoEnEdicion] = useState(null);
  const [error, setError] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Psicólogo pendiente de confirmación de borrado (reemplaza window.confirm)
  const [psicologoAEliminar, setPsicologoAEliminar] = useState(null);

  // Solo hace las llamadas a Supabase, sin tocar ningún estado. La comparte
  // cargarDatos() (para los handlers) y el efecto de montaje de abajo, cada
  // uno con su propio manejo de estado alrededor.
  const obtenerPsicologosYAsignaciones = () =>
    Promise.all([
      psicologoInstitucionService.obtenerPsicologos(),
      psicologoInstitucionService.obtenerAsignaciones()
    ]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [psicologosData, asignacionesData] = await obtenerPsicologosYAsignaciones();
      setPsicologos(psicologosData);
      setAsignaciones(asignacionesData);
    } catch (error) {
      console.error("Error cargando panel de psicólogos:", error);
      setError("No se pudieron cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial declarada dentro del propio efecto (patrón recomendado
  // por React para fetch-on-mount): no necesita poner loading en true
  // porque ya arranca en true por defecto, y la bandera "activo" evita
  // actualizar estado si el componente se desmonta antes de que responda.
  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const [psicologosData, asignacionesData] = await obtenerPsicologosYAsignaciones();
        if (!activo) return;
        setPsicologos(psicologosData);
        setAsignaciones(asignacionesData);
      } catch (error) {
        if (!activo) return;
        console.error("Error cargando panel de psicólogos:", error);
        setError("No se pudieron cargar los datos del panel.");
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

  // Un solo selector por fila: institucionIdSeleccionado === '' significa
  // "Sin institución asignada" (desasignar). Cualquier otro valor
  // reemplaza la institución actual del psicólogo, sin importar si ya
  // tenía una — psicologoInstitucionService.asignar() ya se encarga de
  // borrar la anterior antes de insertar la nueva.
  const handleCambiarInstitucion = async (psicologoId, institucionIdSeleccionado) => {
    try {
      setProcesandoId(psicologoId);
      if (institucionIdSeleccionado) {
        await psicologoInstitucionService.asignar(psicologoId, institucionIdSeleccionado);
      } else {
        await psicologoInstitucionService.desasignar(psicologoId);
      }
      await cargarDatos();
    } catch (error) {
      console.error("Error al modificar la asignación:", error);
      alert("Error al modificar la asignación.");
    } finally {
      setProcesandoId(null);
    }
  };

  const handleOpenModal = (psicologo = null) => {
    setPsicologoEnEdicion(psicologo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPsicologoEnEdicion(null);
  };

  const handleSave = async (datos) => {
    try {
      if (psicologoEnEdicion) {
        await psicologosService.editar(psicologoEnEdicion.id, datos);
      } else {
        await psicologosService.crear(datos);
      }
      await cargarDatos();
      handleCloseModal();
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  // Ya no confirma acá directamente: solo abre el modal con el psicólogo
  // elegido; confirmarEliminarPsicologo es quien realmente lo elimina.
  const handleDelete = (psicologo) => {
    setPsicologoAEliminar(psicologo);
  };

  const confirmarEliminarPsicologo = async () => {
    try {
      await psicologosService.eliminar(psicologoAEliminar.id);
      await cargarDatos();
      setPsicologoAEliminar(null);
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '-';
    return new Date(fechaString).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hayBusquedaActiva = terminoBusqueda.trim().length > 0;

  const psicologosFiltrados = useMemo(() => {
    const termino = terminoBusqueda.trim().toLowerCase();
    if (!termino) return psicologos;
    return psicologos.filter((psico) => {
      const nombre = (psico.nombre || '').toLowerCase();
      const correo = (psico.email || '').toLowerCase();
      return nombre.includes(termino) || correo.includes(termino);
    });
  }, [psicologos, terminoBusqueda]);

  const limpiarFiltros = () => setTerminoBusqueda('');

  return (
    <div className="space-y-6">
      {/* Barra de acciones superior idéntica a Instituciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-black">Personal Clínico Autorizado</h2>
          <p className="text-xs text-gray-700 font-medium">Vincula cada profesional de la salud mental a un único entorno operativo del Observatorio.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-violet-400 hover:bg-orange-800 text-white font-bold uppercase tracking-wide text-sm px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+ Agregar Psicólogo/a</span>
        </button>
      </div>

      {/* Barra de búsqueda: solo se muestra si existe al menos un psicólogo cargado */}
      {!loading && psicologos.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          <input
            type="text"
            aria-label="Buscar psicólogos por nombre o correo electrónico"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo electrónico..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          />
          <button
            onClick={limpiarFiltros}
            disabled={!hayBusquedaActiva}
            className="text-sm font-bold uppercase tracking-wide px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 whitespace-nowrap bg-gray-400 text-white disabled:bg-gray-300 disabled:cursor-not-allowed enabled:bg-violet-400 enabled:hover:bg-orange-800"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
          {error}
        </div>
      )}

      {/* Contenedor de la Tabla Principal */}
      <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Usuario / Correo
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Fecha Alta
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Institución Asignada
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
              ) : psicologos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-sm font-medium text-gray-400 bg-gray-50">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-gray-500 text-base font-bold">No se encontraron cuentas activas</p>
                      <p className="text-xs text-gray-400">Aún no hay usuarios registrados con el rol de Psicólogo/a en la plataforma diagnóstica.</p>
                    </div>
                  </td>
                </tr>
              ) : psicologosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-sm font-medium text-gray-400 bg-gray-50">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-gray-500 text-base font-bold">No se encontraron psicólogos con estos criterios.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                psicologosFiltrados.map((psico) => (
                  <tr key={psico.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-semibold text-gray-800">
                        {psico.nombre || <span className="text-gray-400 italic font-normal">Sin nombre registrado</span>}
                      </div>
                      <div className="text-xs text-gray-500">{psico.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(psico.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {instituciones.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No existen instituciones base configuradas</span>
                      ) : (
                        (() => {
                          const asignacionActual = asignaciones.find((a) => a.psicologo_id === psico.id);
                          const isProcessing = procesandoId === psico.id;

                          return (
                            <select
                              value={asignacionActual?.institucion_id || ''}
                              disabled={isProcessing}
                              onChange={(e) => handleCambiarInstitucion(psico.id, e.target.value)}
                              className={`w-full max-w-xs px-3 py-2 text-xs font-bold rounded-md border shadow-sm outline-none transition-colors focus:ring-2 focus:ring-violet-400 focus:border-violet-400 ${
                                isProcessing ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                              } ${
                                asignacionActual
                                  ? 'bg-violet-400 text-white border-orange-800'
                                  : 'bg-white text-gray-600 border-gray-300'
                              }`}
                            >
                              <option value="" className="bg-white text-gray-600">
                                Sin institución asignada
                              </option>
                              {instituciones.map((inst) => (
                                <option key={inst.id} value={inst.id} className="bg-white text-gray-800">
                                  {inst.nombre}
                                </option>
                              ))}
                            </select>
                          );
                        })()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => handleOpenModal(psico)}
                          className="text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(psico)}
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

      {/* COMPONENTE MODAL */}
      <PsicologoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        psicologoEditado={psicologoEnEdicion}
      />

      {/* Confirmación de borrado de psicólogo */}
      <ModalConfirmacion
        isOpen={!!psicologoAEliminar}
        titulo="¿Eliminar esta cuenta?"
        mensaje={
          psicologoAEliminar
            ? `Se eliminará permanentemente la cuenta de ${psicologoAEliminar.email} y su vínculo con la institución asignada. Esta acción no se puede deshacer.`
            : ''
        }
        onConfirm={confirmarEliminarPsicologo}
        onCancel={() => setPsicologoAEliminar(null)}
      />
    </div>
  );
};