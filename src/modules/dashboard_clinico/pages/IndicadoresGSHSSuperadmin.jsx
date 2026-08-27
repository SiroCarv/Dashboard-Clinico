// Sección de resultados del GSHS para el superadministrador (SCRUM-57):
// porcentaje de riesgo por módulo consolidado entre todas las
// instituciones, con un filtro para acotarlo a una sola institución
// (criterio de aceptación 3 de la historia).
import { Link } from 'react-router-dom';
import { useIndicadoresGSHS } from '../hooks/useIndicadoresGSHS';
import { GraficoModulosGSHS } from '../components/GraficoModulosGSHS';
import { BotonCerrarSesion } from '../../autenticacion';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

export default function IndicadoresGSHSSuperadmin() {
  const {
    modulos,
    totalEvaluaciones,
    loading,
    error,
    instituciones,
    filtroInstitucion,
    setFiltroInstitucion,
    FILTRO_INSTITUCION_TODAS,
  } = useIndicadoresGSHS();

  return (
    <div className="min-h-screen bg-violet-50 p-6 md:p-10 relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <Link
              to="/panel-resultados"
              className="text-gray-500 hover:text-orange-700 font-bold transition-colors"
            >
              ← Volver al Panel Consolidado
            </Link>
            <h1 className="text-3xl font-extrabold text-black mt-2">Resultados del GSHS</h1>
            <p className="text-gray-700 mt-2 font-semibold">
              Porcentaje de riesgo por módulo, consolidado entre todas las instituciones.
            </p>
          </div>
          <BotonCerrarSesion />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {!loading && instituciones.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                Institución
              </label>
              <select
                value={filtroInstitucion}
                onChange={(e) => setFiltroInstitucion(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
              >
                <option value={FILTRO_INSTITUCION_TODAS}>Todas las instituciones</option>
                {instituciones.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg
              className="animate-spin h-10 w-10 text-orange-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-700 font-semibold">Cargando resultados del GSHS...</span>
          </div>
        ) : (
          <GraficoModulosGSHS modulos={modulos} totalEvaluaciones={totalEvaluaciones} />
        )}
      </div>
    </div>
  );
}