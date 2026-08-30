// Sección de resultados del GSHS para el psicólogo (SCRUM-57): el
// porcentaje de riesgo de cada módulo, ya acotado a su propia
// institución por RLS (un psicólogo solo puede estar vinculado a una
// institución — SCRUM-49), así que esta pantalla no necesita ningún
// filtro propio.
//
// Barras + dona (corrección posterior a SCRUM-57): se agrega el resumen
// de "con alerta / sin alerta" en el mismo formato que ya usa
// ResumenFormularios.jsx (SeccionGraficoInstrumento) — el gráfico por
// módulo (GraficoModulosGSHS, barras horizontales) se mantiene igual,
// esto se suma, no lo reemplaza.
import { Link } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useIndicadoresGSHS } from '../hooks/useIndicadoresGSHS';
import { GraficoModulosGSHS } from '../components/GraficoModulosGSHS';
import { SeccionGraficoInstrumento } from '../components/SeccionGraficoInstrumento';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

export default function IndicadoresGSHS() {
  const { modulos, resumenAlerta, totalEvaluaciones, loading, error } = useIndicadoresGSHS();

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Panel de Administración (Psicólogo/a)" />

      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-gray-500 hover:text-orange-700 font-bold transition-colors">
          ← Volver al Dashboard
        </Link>

        <div className="mt-2 mb-6">
          <h2 className="text-2xl font-extrabold text-black">Resultados del GSHS</h2>
          <p className="text-gray-700 mt-1 font-semibold">
            Porcentaje de riesgo por módulo entre los estudiantes de tu institución.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg
              className="animate-spin h-10 w-10 text-violet-400"
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
          <div className="space-y-4">
            <SeccionGraficoInstrumento
              titulo={`GSHS — ${totalEvaluaciones} ${totalEvaluaciones === 1 ? 'evaluación considerada' : 'evaluaciones consideradas'}`}
              datos={resumenAlerta}
            />
            <GraficoModulosGSHS modulos={modulos} totalEvaluaciones={totalEvaluaciones} />
          </div>
        )}
      </div>
    </div>
  );
}