import { useMemo, useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useListaPacientes } from '../hooks/useListaPacientes';
import { TablaPacientes } from '../components/TablaPacientes';
import { exportarPacientesAExcel } from '../utils/exportarPacientesExcel';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

const FILTRO_INSTITUCION_TODAS = 'todas';

// SCRUM-31 — "Informe Consolidado de Pruebas por Paciente": el Dashboard
// dejó de tener 2 pestañas (Clima de Aula/GSHS + "Historial anterior
// PHQ-9"). La pantalla de historial PHQ-9 y su ruta de detalle
// (DetalleClinico.jsx, SCRUM-21) se retiraron por completo — decisión
// explícita del cliente, ver notas de la sesión. La única vista ahora es
// el listado de pacientes; buscar/filtrar/exportar se aplican sobre ese
// listado, no sobre evaluaciones puntuales.
export default function Dashboard() {
  const { pacientes, loading, error } = useListaPacientes();
  const [busqueda, setBusqueda] = useState('');
  const [filtroInstitucion, setFiltroInstitucion] = useState(FILTRO_INSTITUCION_TODAS);
  const [exportando, setExportando] = useState(false);

  // Instituciones únicas derivadas de los pacientes ya cargados: no se
  // necesita ninguna llamada nueva a Supabase ni un import cruzado al
  // módulo `instituciones` para poblar este filtro (mismo patrón que ya
  // usaba SCRUM-20 sobre `evaluaciones`).
  const instituciones = useMemo(() => {
    const nombres = pacientes.map((p) => p.institucion?.nombre).filter(Boolean);
    return Array.from(new Set(nombres)).sort((a, b) => a.localeCompare(b));
  }, [pacientes]);

  const pacientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return pacientes.filter((p) => {
      const coincideInstitucion =
        filtroInstitucion === FILTRO_INSTITUCION_TODAS ||
        p.institucion?.nombre === filtroInstitucion;

      const coincideBusqueda =
        texto === '' ||
        p.nombre?.toLowerCase().includes(texto) ||
        p.email?.toLowerCase().includes(texto);

      return coincideInstitucion && coincideBusqueda;
    });
  }, [pacientes, busqueda, filtroInstitucion]);

  const hayFiltrosActivos =
    busqueda.trim() !== '' || filtroInstitucion !== FILTRO_INSTITUCION_TODAS;

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroInstitucion(FILTRO_INSTITUCION_TODAS);
  };

  // Historia "Exportación a Excel" (SCRUM-14), adaptada al listado de
  // pacientes. Recibe `pacientesFiltrados` -no `pacientes`- a propósito:
  // el archivo debe reflejar exactamente lo que el psicólogo ve en
  // pantalla tras aplicar búsqueda/filtros, nunca el padrón completo.
  const handleExportarExcel = async () => {
    if (pacientesFiltrados.length === 0) return;
    setExportando(true);
    try {
      await exportarPacientesAExcel(pacientesFiltrados);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Panel de Administración (Psicólogo/a)" />

      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-black">Dashboard Clínico</h2>
          <p className="text-gray-700 mt-1 font-semibold">
            Seguimiento consolidado del estado clínico de tus participantes y consultantes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {!loading && pacientes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
            />

            {instituciones.length > 0 && (
              <select
                value={filtroInstitucion}
                onChange={(e) => setFiltroInstitucion(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
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
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-100 hover:text-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-700"
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

            <button
              type="button"
              onClick={handleExportarExcel}
              disabled={pacientesFiltrados.length === 0 || exportando}
              title={
                pacientesFiltrados.length === 0
                  ? 'No hay datos visibles para exportar'
                  : undefined
              }
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${COLOR_MARCA.tealAzulado.botonPrimario}`}
            >
              {exportando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando...
                </>
              ) : (
                <>
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
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Exportar a Excel
                </>
              )}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-700 font-semibold">Cargando participantes y consultantes...</span>
          </div>
        ) : (
          <TablaPacientes pacientes={pacientesFiltrados} hayFiltrosActivos={hayFiltrosActivos} />
        )}
      </div>
    </div>
  );
}