import { useMemo, useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useHistorialEvaluaciones } from '../hooks/useHistorialEvaluaciones';
import { TablaHistorialEvaluaciones } from '../components/TablaHistorialEvaluaciones';

export default function Dashboard() {
  const { evaluaciones, loading, error } = useHistorialEvaluaciones();
  const [busqueda, setBusqueda] = useState('');
  const [filtroDiagnostico, setFiltroDiagnostico] = useState('todos');

  const evaluacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return evaluaciones.filter((ev) => {
      const coincideDiagnostico =
        filtroDiagnostico === 'todos' || ev.diagnostico === filtroDiagnostico;

      const coincideBusqueda =
        texto === '' ||
        ev.paciente?.nombre?.toLowerCase().includes(texto) ||
        ev.paciente?.email?.toLowerCase().includes(texto);

      return coincideDiagnostico && coincideBusqueda;
    });
  }, [evaluaciones, busqueda, filtroDiagnostico]);

  const totalAlertas = evaluaciones.filter((ev) => ev.alerta_activada).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <BarraSuperior titulo="Panel de Administración (Psicólogo)" />

      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-black">Dashboard de Historiales</h2>
          <p className="text-gray-500 mt-1 font-medium">
            Seguimiento consolidado del estado clínico de tus pacientes.
          </p>
        </div>

        {totalAlertas > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md shadow-sm">
            <p className="font-bold">
              ⚠️ {totalAlertas} evaluación{totalAlertas !== 1 ? 'es' : ''} con diagnóstico Severo
            </p>
            <p className="text-sm mt-1">Revisa estos casos con prioridad.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {!loading && evaluaciones.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por paciente..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
            />
            <select
              value={filtroDiagnostico}
              onChange={(e) => setFiltroDiagnostico(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
            >
              <option value="todos">Todos los diagnósticos</option>
              <option value="Leve">Leve</option>
              <option value="Moderado">Moderado</option>
              <option value="Severo">Severo</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-500 font-medium">Cargando historiales...</span>
          </div>
        ) : (
          <TablaHistorialEvaluaciones evaluaciones={evaluacionesFiltradas} />
        )}
      </div>
    </div>
  );
}