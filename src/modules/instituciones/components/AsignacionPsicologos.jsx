import { useState, useEffect } from 'react';
import { psicologoInstitucionService } from '../services/psicologoInstitucionService';
import { PsicologoModal } from './PsicologoModal';

export const AsignacionPsicologos = ({ instituciones }) => {
  const [psicologos, setPsicologos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Personal Clínico Autorizado</h2>
          <p className="text-xs text-gray-500">Asigna profesionales de la salud mental a los entornos operativos del Observatorio.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2.5 rounded-md shadow-md transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+ Agregar Psicólogo</span>
        </button>
      </div>

      {/* Contenedor de la Tabla Principal */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuario / Correo
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha Alta
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Áreas e Instituciones Vinculadas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-8 border-t-2 border-orange-500"></div>
                      <span className="text-sm text-gray-500 font-medium">Sincronizando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : psicologos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center text-sm font-medium text-gray-400 bg-gray-50/50">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-gray-500 text-base font-semibold">No se encontraron cuentas activas</p>
                      <p className="text-xs text-gray-400">Aún no hay usuarios registrados con el rol de Psicólogo en la plataforma diagnóstica.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                psicologos.map((psico) => (
                  <tr key={psico.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {psico.email}
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
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all shadow-sm ${
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
        onClose={() => setIsModalOpen(false)}
        onSave={async (datos) => {
          // Lógica temporal para probar la UI
          console.log("Datos del nuevo psicólogo:", datos);
          alert("Interfaz conectada. La creación real de usuarios en Supabase requiere configuración adicional.");
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};