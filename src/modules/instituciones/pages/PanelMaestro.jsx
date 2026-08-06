import { useState, useEffect } from 'react';
import { institucionesService } from '../services/institucionesService';
import { InstitucionList } from '../components/InstitucionList';
import { InstitucionModal } from '../components/InstitucionModal';
import { AsignacionPsicologos } from '../components/AsignacionPsicologos';
import { BotonCerrarSesion } from '../../autenticacion';
import { ModalConfirmacion } from '../../../shared/components/ModalConfirmacion';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

export default function PanelMaestro() {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState('instituciones');

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [institucionEnEdicion, setInstitucionEnEdicion] = useState(null);

  // Institución pendiente de confirmación de borrado (reemplaza window.confirm)
  const [institucionAEliminar, setInstitucionAEliminar] = useState(null);

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

  // Carga inicial declarada dentro del propio efecto (patrón recomendado
  // por React para fetch-on-mount): no necesita poner loading en true
  // porque ya arranca en true por defecto, y la bandera "activo" evita
  // actualizar estado si el componente se desmonta antes de que responda.
  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const data = await institucionesService.getInstituciones();
        if (!activo) return;
        setInstituciones(data);
      } catch (err) {
        if (!activo) return;
        setError('Error al cargar las instituciones.');
        console.error(err);
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

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

  // Ya no confirma aquí: solo abre el modal con la institución elegida.
  const handleDelete = (id) => {
    const institucion = instituciones.find((inst) => inst.id === id);
    setInstitucionAEliminar(institucion);
  };

  const confirmarEliminarInstitucion = async () => {
    try {
      await institucionesService.deleteInstitucion(institucionAEliminar.id);
      await cargarInstituciones();
      setInstitucionAEliminar(null);
    } catch (err) {
      alert('Error al eliminar. Puede que haya psicólogos o pacientes asignados a esta institución.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 p-6 md:p-10 relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-black">Panel Maestro</h1>
            <p className="text-gray-700 mt-2 font-semibold">Gestión administrativa de instituciones y códigos de acceso.</p>
          </div>
          <BotonCerrarSesion />
        </div>

        {/* Pestañas: acento único en naranja (la app pasó a usar solo 2
            colores de marca: violeta y naranja — ya no se usan los otros
            2 colores de COLOR_MARCA como acento por pestaña). */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTabActiva('instituciones')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              tabActiva === 'instituciones'
                ? COLOR_MARCA.naranja.tabActivo
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Instituciones
          </button>
          <button
            onClick={() => setTabActiva('psicologos')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              tabActiva === 'psicologos'
                ? COLOR_MARCA.naranja.tabActivo
                : 'border-transparent text-gray-700 hover:text-gray-900'
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
            <svg className="animate-spin h-10 w-10 text-orange-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-700 font-semibold">Cargando instituciones...</span>
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

        {/* Confirmación de borrado de institución */}
        <ModalConfirmacion
          isOpen={!!institucionAEliminar}
          titulo="¿Eliminar esta institución?"
          mensaje={
            institucionAEliminar
              ? `Esta acción no se puede deshacer. Se eliminará "${institucionAEliminar.nombre}" y su código de acceso dejará de funcionar.`
              : ''
          }
          onConfirm={confirmarEliminarInstitucion}
          onCancel={() => setInstitucionAEliminar(null)}
        />
      </div>
    </div>
  );
}