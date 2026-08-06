import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useInformeConsolidado } from '../hooks/useInformeConsolidado';
import InformeConsolidadoPaciente from '../components/InformeConsolidadoPaciente';
import { exportarInformePacienteAExcel } from '../utils/exportarInformePacienteExcel';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
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
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-black">Informe Consolidado de Pruebas</h2>
            <p className="text-gray-700 mt-1 font-semibold">
              Todas las pruebas completadas por esta persona, cada una por separado.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!loading && !error && paciente && (
              <button
                type="button"
                onClick={handleExportar}
                disabled={exportando}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${COLOR_MARCA.tealAzulado.botonPrimario}`}
              >
                {exportando ? (
                  <>
                    <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Exportar a Excel
                  </>
                )}
              </button>
            )}

            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-orange-700 font-bold transition-colors"
            >
              ← Volver al Dashboard
            </Link>
          </div>
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
          <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500 font-medium">
            No se encontró esta persona, o no tienes acceso a su información.
          </div>
        ) : (
          <InformeConsolidadoPaciente paciente={paciente} instrumentos={instrumentos} />
        )}
      </div>
    </div>
  );
}