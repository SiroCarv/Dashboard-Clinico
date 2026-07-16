import { useState, useEffect } from 'react';
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

  // Psicólogo pendiente de confirmación de borrado (reemplaza window.confirm)
  const [psicologoAEliminar, setPsicologoAEliminar] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [psicologosData, asignacionesData] = await Promise.all([
        psicologoInstitucionService.obtenerPsicologos(),
        psicologoInstitucionService.obtenerAsignaciones()
      ]);
      setPsicologos(psicologosData);
      setAsignaciones(asignacionesData);
    } catch (error) {
      console.error("Error cargando panel de psicólogos:", error);
      setError("No se pudieron cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAsignacion = async (psicologoId, institucionId, estaAsignado) => {
    try {
      setProcesandoId(`${psicologoId}-${institucionId}`);
      if (estaAsignado) {
        await psicologoInstitucionService.remover(psicologoId, institucionId);
      } else {
        await psicologoInstitucionService.asignar(psicologoId, institucionId);
      }
      await cargarDatos();
    } catch (error) {
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

  // Ya no confirma aquí: solo abre el modal con el psicólogo elegido.
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

  return (
    <div className="space-y-6">
      {/* Barra de acciones superior idéntica a Instituciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-black">Personal Clínico Autorizado</h2>
          <p className="text-xs text-gray-500">Asigna profesionales de la salud mental a los entornos operativos del Observatorio.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wide text-sm px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+ Agregar Psicólogo</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
          {error}
        </div>
      )}

      {/* Contenedor de la Tabla Principal */}
      <div className="bg-white rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
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
                  Áreas e Instituciones Vinculadas
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
                      <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span className="text-sm text-gray-500 font-medium">Sincronizando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : psicologos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-sm font-medium text-gray-400 bg-gray-50">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-gray-500 text-base font-bold">No se encontraron cuentas activas</p>
                      <p className="text-xs text-gray-400">Aún no hay usuarios registrados con el rol de Psicólogo en la plataforma diagnóstica.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                psicologos.map((psico) => (
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
                      <div className="flex flex-wrap gap-2">
                        {instituciones.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">No existen instituciones base configuradas</span>
                        ) : (
                          instituciones.map((inst) => {
                            const estaAsignado = asignaciones.some(
                              a => a.psicologo_id === psico.id && a.institucion_id === inst.id
                            );
                            const isProcessing = procesandoId === `${psico.id}-${inst.id}`;

                            return (
                              <button
                                key={inst.id}
                                disabled={isProcessing}
                                onClick={() => handleToggleAsignacion(psico.id, inst.id, estaAsignado)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors shadow-sm ${
                                  isProcessing ? 'opacity-40 cursor-not-allowed' : ''
                                } ${
                                  estaAsignado
                                    ? 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                              >
                                {inst.nombre} {estaAsignado ? '✓' : '+'}
                              </button>
                            );
                          })
                        )}
                      </div>
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
            ? `Se eliminará permanentemente la cuenta de ${psicologoAEliminar.email} y todas sus asignaciones a instituciones. Esta acción no se puede deshacer.`
            : ''
        }
        onConfirm={confirmarEliminarPsicologo}
        onCancel={() => setPsicologoAEliminar(null)}
      />
    </div>
  );
};