import { useState, useEffect } from 'react';
import { institucionesService } from '../services/institucionesService';
import { InstitucionList } from '../components/InstitucionList';
import { InstitucionModal } from '../components/InstitucionModal';
import { AsignacionPsicologos } from '../components/AsignacionPsicologos';

export default function PanelMaestro() {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState('instituciones');

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [institucionEnEdicion, setInstitucionEnEdicion] = useState(null);

  useEffect(() => {
    cargarInstituciones();
  }, []);

  const cargarInstituciones = async () => {
    try {
      setLoading(true);
      const data = await institucionesService.getInstituciones();
      setInstituciones(data);
    } catch (err) {
      setError('Error al cargar las instituciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (institucion = null) => {
    setInstitucionEnEdicion(institucion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInstitucionEnEdicion(null);
  };

  const handleSave = async (datos) => {
    try {
      if (institucionEnEdicion) {
        await institucionesService.updateInstitucion(institucionEnEdicion.id, datos);
      } else {
        await institucionesService.createInstitucion(datos);
      }
      await cargarInstituciones();
      handleCloseModal();
    } catch (err) {
      alert('Error real de la base de datos: ' + err.message);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta institución? Esta acción no se puede deshacer.')) {
      try {
        await institucionesService.deleteInstitucion(id);
        await cargarInstituciones();
      } catch (err) {
        alert('Error al eliminar. Puede que haya psicólogos o pacientes asignados a esta institución.');
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel Maestro</h1>
            <p className="text-gray-500 mt-1">Gestión administrativa de instituciones y códigos de acceso.</p>
          </div>
          {tabActiva === 'instituciones' && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 font-medium shadow-md shadow-orange-500/30 transition-all"
            >
              + Nueva Institución
            </button>
          )}
        </div>

        {/* Pestañas */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTabActiva('instituciones')}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 -mb-px transition-colors ${
              tabActiva === 'instituciones'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Instituciones
          </button>
          <button
            onClick={() => setTabActiva('psicologos')}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 -mb-px transition-colors ${
              tabActiva === 'psicologos'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Psicólogos
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Contenido Principal */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : tabActiva === 'instituciones' ? (
          <InstitucionList 
            instituciones={instituciones} 
            onEdit={handleOpenModal} 
            onDelete={handleDelete} 
          />
        ) : (
          <AsignacionPsicologos instituciones={instituciones} />
        )}

        {/* Modal de Creación/Edición */}
        <InstitucionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          institucionEditada={institucionEnEdicion}
        />
      </div>
    </div>
  );
}