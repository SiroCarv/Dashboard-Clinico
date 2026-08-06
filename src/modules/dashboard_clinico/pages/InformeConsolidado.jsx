// Página de detalle de UN paciente (SCRUM-31), a la que se llega al
// hacer clic en una fila de la tabla del Dashboard. Solo orquesta:
// useInformeConsolidado trae los datos, InformeConsolidadoPaciente
// decide cómo mostrarlos, y acá se resuelve el estado de carga/error/
// "no encontrado o sin acceso" antes de renderizar cualquiera de los dos.
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useInformeConsolidado } from '../hooks/useInformeConsolidado';
import InformeConsolidadoPaciente from '../components/InformeConsolidadoPaciente';
import { exportarInformePacienteAExcel } from '../utils/exportarInformePacienteExcel';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

export default function InformeConsolidado() {
  const { idPaciente } = useParams();
  const { paciente, instrumentos, loading, error } = useInformeConsolidado(idPaciente);
  const [exportando, setExportando] = useState(false);

  const handleExportar = async () => {
    if (!paciente) return;
    setExportando(true);
    try {
      await exportarInformePacienteAExcel(paciente, instrumentos);
    } catch (err) {
      console.error('Error al exportar el informe:', err.message);
      alert('Ocurrió un error al generar el archivo. Intenta nuevamente.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma.
          Opacidad baja (10%): acá el título y el link "Volver" quedan
          sueltos sobre el fondo, sin una tarjeta blanca debajo. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Panel de Administración (Psicólogo/a)" />

      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="mb-3">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-orange-700 font-bold transition-colors"
            >
              ← Volver al Dashboard
            </Link>
          </div>

          <h2 className="text-2xl font-extrabold text-black">Informe Consolidado de Pruebas</h2>
          <p className="text-gray-700 mt-1 font-semibold">
            Todas las pruebas completadas por esta persona, cada una por separado.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 font-semibold">Cargando informe...</span>
          </div>
        ) : !paciente ? (
          // Mensaje único a propósito para "no existe" y "existe pero no
          // tengo acceso" (RLS deniega en silencio) — no se distingue
          // entre ambos casos para no revelarle a un psicólogo si un ID
          // de paciente ajeno existe o no en la base de datos.
          <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500 font-medium">
            No se encontró esta persona, o no tienes acceso a su información.
          </div>
        ) : (
          <InformeConsolidadoPaciente
            paciente={paciente}
            instrumentos={instrumentos}
            exportando={exportando}
            onExportar={handleExportar}
          />
        )}
      </div>
    </div>
  );
}
