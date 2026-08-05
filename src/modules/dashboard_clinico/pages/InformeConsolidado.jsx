import { useParams, Link } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useInformeConsolidado } from '../hooks/useInformeConsolidado';
import InformeConsolidadoPaciente from '../components/InformeConsolidadoPaciente';

export default function InformeConsolidado() {
  const { idPaciente } = useParams();
  const { paciente, instrumentos, loading, error } = useInformeConsolidado(idPaciente);

  return (
    <div className="min-h-screen bg-gray-100">
      <BarraSuperior titulo="Panel de Administración (Psicólogo)" />

      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-black">Informe Consolidado de Pruebas</h2>
            <p className="text-gray-500 mt-1 font-medium">
              Todas las pruebas completadas por esta persona, cada una por separado.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-violet-400 hover:text-orange-800 font-bold transition-colors"
          >
            ← Volver al Dashboard
          </Link>
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
            <span className="text-gray-500 font-medium">Cargando informe...</span>
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
