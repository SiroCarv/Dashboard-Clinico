// Panel consolidado del superadministrador (SCRUM-56): un listado de
// TODOS los resultados de evaluaciones del sistema (todas las
// instituciones y psicólogos), con filtro por institución, por
// psicólogo, por origen del registro (SCRUM-60) y por rango de fechas.
// A diferencia de Dashboard.jsx (el panel del psicólogo, que lista
// pacientes), acá cada fila es un resultado puntual — el criterio de
// aceptación pide identificar institución y psicólogo "por cada
// resultado", no por paciente.
//
// Institución y psicólogo (corrección posterior a SCRUM-56): las
// opciones de estos dos selects YA NO se derivan de los resultados
// cargados — eso dejaba afuera a cualquier institución o psicólogo sin
// evaluaciones todavía. Ahora vienen de los catálogos completos
// (useInstitucionesCatalogo / usePsicologosCatalogo), consultados
// directo a los módulos `instituciones` y `psicologos` a través de su
// API pública. El filtro sigue aplicándose en memoria sobre el listado
// de resultados ya cargado, comparando por nombre (ver limitación
// documentada en usePsicologosCatalogo.js).
//
// SCRUM-60 — Detalle de casos registrados por docente: se suma acá un
// filtro más, "Origen del registro", con el mismo criterio que ya usa
// Dashboard.jsx (SCRUM-53) para su propio filtro "Estudiante/Docente" —
// mismos valores ('estudiante' | 'docente'), aunque la fuente es
// distinta: allá se deriva por paciente (agregando varias evaluaciones),
// acá es directo por fila, porque cada resultado YA es una sola
// evaluación con su propio `registrado_por_docente_id`.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResultadosGlobales } from '../hooks/useResultadosGlobales';
import { useInstitucionesCatalogo } from '../hooks/useInstitucionesCatalogo';
import { usePsicologosCatalogo } from '../hooks/usePsicologosCatalogo';
import { TablaResultadosGlobales } from '../components/TablaResultadosGlobales';
import { BotonCerrarSesion } from '../../autenticacion';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

const FILTRO_INSTITUCION_TODAS = 'todas';
const FILTRO_PSICOLOGO_TODOS = 'todos';
const FILTRO_TIPO_PERSONA_TODOS = 'todos';
const FILTRO_TIPO_PERSONA_ESTUDIANTE = 'estudiante';
const FILTRO_TIPO_PERSONA_DOCENTE = 'docente';

export default function PanelConsolidadoSuperadmin() {
  const { resultados, loading, error } = useResultadosGlobales();
  const { instituciones } = useInstitucionesCatalogo();
  const { psicologos } = usePsicologosCatalogo();
  const [filtroInstitucion, setFiltroInstitucion] = useState(FILTRO_INSTITUCION_TODAS);
  const [filtroPsicologo, setFiltroPsicologo] = useState(FILTRO_PSICOLOGO_TODOS);
  const [filtroTipoPersona, setFiltroTipoPersona] = useState(FILTRO_TIPO_PERSONA_TODOS);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const resultadosFiltrados = useMemo(() => {
    // "Hasta" incluye el día completo (23:59:59), no solo su medianoche
    // — si no, un resultado registrado a las 15:00 del último día del
    // rango quedaría afuera al comparar contra T00:00:00.
    const desde = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
    const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;

    return resultados.filter((r) => {
      const coincideInstitucion =
        filtroInstitucion === FILTRO_INSTITUCION_TODAS ||
        r.paciente?.institucion?.nombre === filtroInstitucion;

      const coincidePsicologo =
        filtroPsicologo === FILTRO_PSICOLOGO_TODOS ||
        r.paciente?.psicologo_asignado?.nombre === filtroPsicologo;

      // SCRUM-60 — cada resultado ya trae su propio origen: no hay caso
      // "sin evaluaciones" como en pacientesService.js (esta fila ES una
      // evaluación), así que alcanza con revisar si tiene un docente que
      // la registró o no.
      const tipoPersonaResultado = r.registrado_por_docente_id
        ? FILTRO_TIPO_PERSONA_DOCENTE
        : FILTRO_TIPO_PERSONA_ESTUDIANTE;
      const coincideTipoPersona =
        filtroTipoPersona === FILTRO_TIPO_PERSONA_TODOS || tipoPersonaResultado === filtroTipoPersona;

      const fecha = new Date(r.fecha_registro);
      const coincideFecha = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);

      return coincideInstitucion && coincidePsicologo && coincideTipoPersona && coincideFecha;
    });
  }, [resultados, filtroInstitucion, filtroPsicologo, filtroTipoPersona, fechaDesde, fechaHasta]);

  const hayFiltrosActivos =
    filtroInstitucion !== FILTRO_INSTITUCION_TODAS ||
    filtroPsicologo !== FILTRO_PSICOLOGO_TODOS ||
    filtroTipoPersona !== FILTRO_TIPO_PERSONA_TODOS ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  const limpiarFiltros = () => {
    setFiltroInstitucion(FILTRO_INSTITUCION_TODAS);
    setFiltroPsicologo(FILTRO_PSICOLOGO_TODOS);
    setFiltroTipoPersona(FILTRO_TIPO_PERSONA_TODOS);
    setFechaDesde('');
    setFechaHasta('');
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
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <Link
              to="/panel-maestro"
              className="text-gray-500 hover:text-orange-700 font-bold transition-colors"
            >
              ← Volver a Panel Maestro
            </Link>
            <h1 className="text-3xl font-extrabold text-black mt-2">Panel Consolidado de Resultados</h1>
            <p className="text-gray-700 mt-2 font-semibold">
              Resultados de evaluaciones de todas las instituciones y psicólogos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Resultados del GSHS por módulo, consolidado (SCRUM-57) */}
            <Link
              to="/panel-resultados/gshs"
              className="flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold shadow-sm transition-colors bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Ver resultados del GSHS
            </Link>
            <BotonCerrarSesion />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {!loading && (
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

            <div className="flex-1 min-w-40">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                Psicólogo
              </label>
              <select
                value={filtroPsicologo}
                onChange={(e) => setFiltroPsicologo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
              >
                <option value={FILTRO_PSICOLOGO_TODOS}>Todos los psicólogos</option>
                {psicologos.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-40">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                Origen del registro
              </label>
              <select
                value={filtroTipoPersona}
                onChange={(e) => setFiltroTipoPersona(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
              >
                <option value={FILTRO_TIPO_PERSONA_TODOS}>Todos</option>
                <option value={FILTRO_TIPO_PERSONA_ESTUDIANTE}>Autoenvío del estudiante</option>
                <option value={FILTRO_TIPO_PERSONA_DOCENTE}>Registrado por docente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                max={fechaHasta || undefined}
                className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                min={fechaDesde || undefined}
                className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
              />
            </div>

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
            <span className="text-gray-700 font-semibold">Cargando resultados...</span>
          </div>
        ) : (
          <TablaResultadosGlobales resultados={resultadosFiltrados} hayFiltrosActivos={hayFiltrosActivos} />
        )}
      </div>
    </div>
  );
}