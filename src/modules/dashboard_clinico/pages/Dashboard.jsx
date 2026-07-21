import { useMemo, useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useHistorialEvaluaciones } from '../hooks/useHistorialEvaluaciones';
import { TablaHistorialEvaluaciones } from '../components/TablaHistorialEvaluaciones';

const FILTRO_DIAGNOSTICO_TODOS = 'todos';
const FILTRO_INSTITUCION_TODAS = 'todas';

export default function Dashboard() {
  const { evaluaciones, loading, error } = useHistorialEvaluaciones();
  const [busqueda, setBusqueda] = useState('');
  const [filtroDiagnostico, setFiltroDiagnostico] = useState(FILTRO_DIAGNOSTICO_TODOS);
  const [filtroInstitucion, setFiltroInstitucion] = useState(FILTRO_INSTITUCION_TODAS);

  // Instituciones únicas derivadas de las evaluaciones ya cargadas: el join de
  // `obtenerHistorial()` ya trae `paciente.institucion.nombre`, así que no se
  // necesita ninguna llamada nueva a Supabase ni un import cruzado al módulo
  // `instituciones` para poblar este filtro (historia SCRUM-20).
  const instituciones = useMemo(() => {
    const nombres = evaluaciones
      .map((ev) => ev.paciente?.institucion?.nombre)
      .filter(Boolean);
    return Array.from(new Set(nombres)).sort((a, b) => a.localeCompare(b));
  }, [evaluaciones]);

  const evaluacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return evaluaciones.filter((ev) => {
      const coincideDiagnostico =
        filtroDiagnostico === FILTRO_DIAGNOSTICO_TODOS || ev.diagnostico === filtroDiagnostico;

      const coincideInstitucion =
        filtroInstitucion === FILTRO_INSTITUCION_TODAS ||
        ev.paciente?.institucion?.nombre === filtroInstitucion;

      const coincideBusqueda =
        texto === '' ||
        ev.paciente?.nombre?.toLowerCase().includes(texto) ||
        ev.paciente?.email?.toLowerCase().includes(texto);

      return coincideDiagnostico && coincideInstitucion && coincideBusqueda;
    });
  }, [evaluaciones, busqueda, filtroDiagnostico, filtroInstitucion]);

  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    filtroDiagnostico !== FILTRO_DIAGNOSTICO_TODOS ||
    filtroInstitucion !== FILTRO_INSTITUCION_TODAS;

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroDiagnostico(FILTRO_DIAGNOSTICO_TODOS);
    setFiltroInstitucion(FILTRO_INSTITUCION_TODAS);
  };

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
              <option value={FILTRO_DIAGNOSTICO_TODOS}>Todos los diagnósticos</option>
              <option value="Leve">Leve</option>
              <option value="Moderado">Moderado</option>
              <option value="Severo">Severo</option>
            </select>

            {instituciones.length > 0 && (
              <select
                value={filtroInstitucion}
                onChange={(e) => setFiltroInstitucion(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
              >
                <option value={FILTRO_INSTITUCION_TODAS}>Todas las instituciones</option>
                {instituciones.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={!hayFiltrosActivos}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-500 font-medium">Cargando historiales...</span>
          </div>
        ) : (
          <TablaHistorialEvaluaciones
            evaluaciones={evaluacionesFiltradas}
            hayFiltrosActivos={hayFiltrosActivos}
          />
        )}
      </div>
    </div>
  );
}