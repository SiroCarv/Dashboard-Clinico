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
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-black">Panel Maestro</h1>
          <p className="text-gray-500 mt-2 font-medium">Gestión administrativa de instituciones y códigos de acceso.</p>
        </div>

        {/* Pestañas */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTabActiva('instituciones')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              tabActiva === 'instituciones'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Instituciones
          </button>
          <button
            onClick={() => setTabActiva('psicologos')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Contenido Principal */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-500 font-medium">Cargando instituciones...</span>
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