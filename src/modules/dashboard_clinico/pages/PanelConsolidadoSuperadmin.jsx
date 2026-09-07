// Panel consolidado del superadministrador (SCRUM-56), con tres pestañas:
//
//   - "Resultados": listado de TODOS los resultados de evaluaciones del
//     sistema (todas las instituciones y psicólogos), con filtro por
//     tipo de institución, institución, por psicólogo, por origen del
//     registro (SCRUM-60) y por rango de fechas. A diferencia de
//     Dashboard.jsx (el panel del psicólogo, que lista pacientes), acá
//     cada fila es un resultado puntual — el criterio de aceptación pide
//     identificar institución y psicólogo "por cada resultado", no por
//     paciente.
//
//   - "Gráficas" (agregada después de SCRUM-56, a pedido del cliente):
//     mismos gráficos de Clima de Aula / GSHS / Estrés / Ansiedad /
//     Depresión / Cuidado Primario De Salud Familiar que ya usa
//     Dashboard.jsx en el panel del psicólogo (useListaPacientes +
//     useResumenFormularios + useIndicadoresGSHS + FiltrosResumen +
//     ResumenFormularios, sin modificar ninguno de esos archivos), pero
//     consolidado entre TODAS las instituciones — RLS ya le da a
//     is_superadmin() acceso total en `usuarios` y
//     `evaluaciones_instrumento` (verificado en vivo), así que no hizo
//     falta ninguna migración. Se agregó un filtro de institución propio
//     de esta pestaña (reutilizando el `filtroInstitucion` que ya expone
//     useIndicadoresGSHS) para poder acotar la vista a una sola
//     institución cuando se necesite. Esta pestaña reemplaza a la
//     pantalla aparte que existía para el GSHS del superadmin
//     (IndicadoresGSHSSuperadmin.jsx, en la ruta /panel-resultados/gshs)
//     — se retiró junto con su botón "Ver resultados del GSHS" del
//     header, porque su contenido (desglose por módulo + resumen de
//     alerta) ya queda cubierto acá adentro por la pestaña GSHS de
//     ResumenFormularios.jsx.
//
//   - "Reportes de Docentes" (nueva, a pedido del cliente): extensión de
//     "Reportes de Docente" (historia ya cerrada, que solo dejaba verlos
//     al psicólogo de la institución del docente) para que el
//     superadministrador también pueda verlos, ahora de TODAS las
//     instituciones a la vez. RLS ya lo permitía (la policy de SELECT de
//     `reportes_docente` ya incluye is_superadmin(), verificado en vivo)
//     — el hueco era solo de interfaz. Reutiliza tal cual la API pública
//     de `casos_docente` (mismo componente y hook que ya consume
//     Dashboard.jsx para el psicólogo), sin duplicar nada.
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
// Tipo de institución (nuevo, a pedido del cliente): filtro dependiente
// que antecede al de institución en ambas pestañas — elegir un tipo
// acota las opciones del select de institución a solo las de ese tipo.
// Usa el mismo catálogo (`instituciones`, ahora con `tipoInstitucion` por
// cada una) para las dos pestañas, pero cada una mantiene su propio
// estado de tipo — mismo criterio que ya usa esta pantalla para el resto
// de sus filtros (Gráficas y Resultados son independientes entre sí). Si
// la institución elegida deja de pertenecer al tipo recién seleccionado,
// el filtro de institución de esa misma pestaña vuelve a "Todas las
// instituciones" en vez de quedarse en un valor que ya no aparece en su
// propia lista de opciones.
//
// SCRUM-60 — Detalle de casos registrados por docente: se suma acá un
// filtro más, "Origen del registro", con el mismo criterio que ya usa
// Dashboard.jsx (SCRUM-53) para su propio filtro "Estudiante/Docente" —
// mismos valores ('estudiante' | 'docente'), aunque la fuente es
// distinta: allá se deriva por paciente (agregando varias evaluaciones),
// acá es directo por fila, porque cada resultado YA es una sola
// evaluación con su propio `registrado_por_docente_id`.
// Formulario / instrumento (corrección posterior): filtro de selección
// múltiple nuevo, con FiltroSeleccionMultiple.jsx — no existía ningún
// filtro por instrumento en esta pantalla. Selección vacía = todos los
// instrumentos (sin filtrar), igual criterio que documenta ese archivo.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResultadosGlobales } from '../hooks/useResultadosGlobales';
import { useInstitucionesCatalogo } from '../hooks/useInstitucionesCatalogo';
import { usePsicologosCatalogo } from '../hooks/usePsicologosCatalogo';
import { useListaPacientes } from '../hooks/useListaPacientes';
import { useResumenFormularios } from '../hooks/useResumenFormularios';
import { useIndicadoresGSHS } from '../hooks/useIndicadoresGSHS';
import { TablaResultadosGlobales } from '../components/TablaResultadosGlobales';
import { FiltroSeleccionMultiple } from '../components/FiltroSeleccionMultiple';
import { FiltrosResumen } from '../components/FiltrosResumen';
import { ResumenFormularios } from '../components/ResumenFormularios';
import { BotonCerrarSesion } from '../../autenticacion';
import { TIPOS_INSTITUCION } from '../../instituciones';
import { PanelReportesInstitucion, useReportesInstitucion } from '../../casos_docente';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

const FILTRO_INSTITUCION_TODAS = 'todas';
const FILTRO_TIPO_INSTITUCION_TODOS = 'todos';
const FILTRO_PSICOLOGO_TODOS = 'todos';
const FILTRO_TIPO_PERSONA_TODOS = 'todos';
const FILTRO_TIPO_PERSONA_ESTUDIANTE = 'estudiante';
const FILTRO_TIPO_PERSONA_DOCENTE = 'docente';

const PESTANA_GRAFICAS = 'graficas';
const PESTANA_RESULTADOS = 'resultados';
const PESTANA_REPORTES_DOCENTES = 'reportes_docentes';

const OPCIONES_INSTRUMENTO = [
  { valor: 'CLIMA_AULA', etiqueta: 'Clima de Aula' },
  { valor: 'GSHS', etiqueta: 'GSHS' },
  { valor: 'ESTRES', etiqueta: 'Estrés' },
  { valor: 'ANSIEDAD', etiqueta: 'Ansiedad' },
  { valor: 'DEPRESION', etiqueta: 'Depresión' },
  { valor: 'APGAR_FAMILIAR', etiqueta: 'Cuidado Primario De Salud Familiar' },
  // Placeholder visual a pedido del cliente: sin instrumento real detrás
  // todavía. Filtrar por esta opción siempre deja la tabla de resultados
  // vacía (ningún resultado tiene tipo_instrumento = 'BULLYING') —
  // comportamiento esperado, no un bug.
  { valor: 'BULLYING', etiqueta: 'Bullying' },
];

export default function PanelConsolidadoSuperadmin() {
  const [pestanaActiva, setPestanaActiva] = useState(PESTANA_GRAFICAS);

  const { resultados, loading, error } = useResultadosGlobales();
  const { instituciones } = useInstitucionesCatalogo();
  const { psicologos } = usePsicologosCatalogo();
  const [filtroInstitucion, setFiltroInstitucion] = useState(FILTRO_INSTITUCION_TODAS);
  const [filtroTipoInstitucion, setFiltroTipoInstitucion] = useState(FILTRO_TIPO_INSTITUCION_TODOS);
  const [filtroPsicologo, setFiltroPsicologo] = useState(FILTRO_PSICOLOGO_TODOS);
  const [filtroTipoPersona, setFiltroTipoPersona] = useState(FILTRO_TIPO_PERSONA_TODOS);
  const [filtroInstrumentos, setFiltroInstrumentos] = useState(() => new Set());
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Pestaña "Reportes de Docentes": alcance completo (todas las
  // instituciones) resuelto por RLS gracias a is_superadmin() — el mismo
  // hook que usa Dashboard.jsx para el psicólogo, sin ningún parámetro
  // distinto. No hace falta ningún estado de filtro nuevo acá: la propia
  // pestaña ya es "ver todo".
  const {
    reportes: reportesDocente,
    loading: loadingReportesDocente,
    error: errorReportesDocente,
  } = useReportesInstitucion();

  // Pestaña "Gráficas": mismos hooks que ya usa Dashboard.jsx (panel del
  // psicólogo) para Clima de Aula, Estrés, Ansiedad y Depresión — ninguno
  // de los tres filtra por institución en el cliente, así que RLS ya le
  // devuelve al superadmin TODOS los pacientes (usuarios_select incluye
  // `is_superadmin()`, verificado en vivo). El único agregado acá es
  // `filtroInstitucionGraficas`, para poder acotar la vista a una sola
  // institución — reutiliza el mismo filtro que ya expone
  // useIndicadoresGSHS() (antes solo lo consumía la pantalla aparte
  // IndicadoresGSHSSuperadmin.jsx, retirada; ahora este panel es su único
  // consumidor), en vez de duplicar el estado: así un
  // solo select controla el alcance de los 5 instrumentos a la vez.
  const { pacientes, loading: loadingPacientes, error: errorPacientes } = useListaPacientes();
  const {
    modulos: modulosGshs,
    resumenAlerta: resumenAlertaGshs,
    totalEvaluaciones: totalEvaluacionesGshs,
    loading: loadingGshs,
    error: errorGshs,
    filtroInstitucion: filtroInstitucionGraficas,
    setFiltroInstitucion: setFiltroInstitucionGraficas,
  } = useIndicadoresGSHS();
  const [filtroTipoInstitucionGraficas, setFiltroTipoInstitucionGraficas] = useState(
    FILTRO_TIPO_INSTITUCION_TODOS
  );

  // Instituciones visibles en el select de institución de cada pestaña,
  // acotadas por el tipo elegido en el select hermano de "Tipo de
  // Institución". Dos listas independientes (una por pestaña) porque
  // cada una tiene su propio estado de tipo, igual que ya pasa con el
  // resto de los filtros de esta pantalla.
  const institucionesGraficas = useMemo(() => {
    if (filtroTipoInstitucionGraficas === FILTRO_TIPO_INSTITUCION_TODOS) return instituciones;
    return instituciones.filter((i) => i.tipoInstitucion === filtroTipoInstitucionGraficas);
  }, [instituciones, filtroTipoInstitucionGraficas]);

  const institucionesResultados = useMemo(() => {
    if (filtroTipoInstitucion === FILTRO_TIPO_INSTITUCION_TODOS) return instituciones;
    return instituciones.filter((i) => i.tipoInstitucion === filtroTipoInstitucion);
  }, [instituciones, filtroTipoInstitucion]);

  // Cambiar el tipo de institución de una pestaña resetea su propia
  // institución elegida a "Todas las instituciones" si esa institución
  // ya no pertenece al tipo nuevo — evita que el select de institución
  // se quede mostrando un valor que dejó de estar entre sus opciones.
  const cambiarTipoInstitucionGraficas = (tipo) => {
    setFiltroTipoInstitucionGraficas(tipo);
    if (tipo === FILTRO_TIPO_INSTITUCION_TODOS || filtroInstitucionGraficas === FILTRO_INSTITUCION_TODAS) return;
    const sigueVisible = instituciones.some(
      (i) => i.nombre === filtroInstitucionGraficas && i.tipoInstitucion === tipo
    );
    if (!sigueVisible) setFiltroInstitucionGraficas(FILTRO_INSTITUCION_TODAS);
  };

  const cambiarTipoInstitucion = (tipo) => {
    setFiltroTipoInstitucion(tipo);
    if (tipo === FILTRO_TIPO_INSTITUCION_TODOS || filtroInstitucion === FILTRO_INSTITUCION_TODAS) return;
    const sigueVisible = instituciones.some((i) => i.nombre === filtroInstitucion && i.tipoInstitucion === tipo);
    if (!sigueVisible) setFiltroInstitucion(FILTRO_INSTITUCION_TODAS);
  };

  const pacientesGraficas = useMemo(() => {
    if (filtroInstitucionGraficas === FILTRO_INSTITUCION_TODAS) return pacientes;
    return pacientes.filter((p) => p.institucion?.nombre === filtroInstitucionGraficas);
  }, [pacientes, filtroInstitucionGraficas]);

  const resumenGraficas = useResumenFormularios(pacientesGraficas);

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

      const coincideInstrumento =
        filtroInstrumentos.size === 0 || filtroInstrumentos.has(r.tipo_instrumento);

      const fecha = new Date(r.fecha_registro);
      const coincideFecha = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);

      return (
        coincideInstitucion && coincidePsicologo && coincideTipoPersona && coincideInstrumento && coincideFecha
      );
    });
  }, [
    resultados,
    filtroInstitucion,
    filtroPsicologo,
    filtroTipoPersona,
    filtroInstrumentos,
    fechaDesde,
    fechaHasta,
  ]);

  const hayFiltrosActivos =
    filtroInstitucion !== FILTRO_INSTITUCION_TODAS ||
    filtroTipoInstitucion !== FILTRO_TIPO_INSTITUCION_TODOS ||
    filtroPsicologo !== FILTRO_PSICOLOGO_TODOS ||
    filtroTipoPersona !== FILTRO_TIPO_PERSONA_TODOS ||
    filtroInstrumentos.size > 0 ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  const limpiarFiltros = () => {
    setFiltroInstitucion(FILTRO_INSTITUCION_TODAS);
    setFiltroTipoInstitucion(FILTRO_TIPO_INSTITUCION_TODOS);
    setFiltroPsicologo(FILTRO_PSICOLOGO_TODOS);
    setFiltroTipoPersona(FILTRO_TIPO_PERSONA_TODOS);
    setFiltroInstrumentos(new Set());
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
            <BotonCerrarSesion />
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
          <button
            type="button"
            onClick={() => setPestanaActiva(PESTANA_GRAFICAS)}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              pestanaActiva === PESTANA_GRAFICAS
                ? COLOR_MARCA.violetaSuave.tabActivo
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Gráficas
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva(PESTANA_RESULTADOS)}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              pestanaActiva === PESTANA_RESULTADOS
                ? COLOR_MARCA.violetaSuave.tabActivo
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Resultados
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva(PESTANA_REPORTES_DOCENTES)}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              pestanaActiva === PESTANA_REPORTES_DOCENTES
                ? COLOR_MARCA.violetaSuave.tabActivo
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Reportes de Docentes
          </button>
        </div>

        {pestanaActiva === PESTANA_GRAFICAS && (
          <>
            {errorPacientes && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
                {errorPacientes}
              </div>
            )}

            {!loadingPacientes && instituciones.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                <div className="flex-1 min-w-40">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                    Tipo de Institución
                  </label>
                  <select
                    value={filtroTipoInstitucionGraficas}
                    onChange={(e) => cambiarTipoInstitucionGraficas(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
                  >
                    <option value={FILTRO_TIPO_INSTITUCION_TODOS}>Todos los tipos</option>
                    {TIPOS_INSTITUCION.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-40">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                    Institución
                  </label>
                  <select
                    value={filtroInstitucionGraficas}
                    onChange={(e) => setFiltroInstitucionGraficas(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
                  >
                    <option value={FILTRO_INSTITUCION_TODAS}>Todas las instituciones</option>
                    {institucionesGraficas.map(({ nombre }) => (
                      <option key={nombre} value={nombre}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {loadingPacientes ? (
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
              <>
                <FiltrosResumen
                  filtros={resumenGraficas.filtros}
                  actualizarFiltro={resumenGraficas.actualizarFiltro}
                  limpiarFiltros={resumenGraficas.limpiarFiltros}
                  hayFiltrosActivos={resumenGraficas.hayFiltrosActivos}
                  generos={resumenGraficas.generos}
                  cursos={resumenGraficas.cursos}
                  paralelos={resumenGraficas.paralelos}
                  turnos={resumenGraficas.turnos}
                  tramosEdad={resumenGraficas.tramosEdad}
                />
                <ResumenFormularios
                  graficoClimaAula={resumenGraficas.graficoClimaAula}
                  graficoEstres={resumenGraficas.graficoEstres}
                  graficoAnsiedad={resumenGraficas.graficoAnsiedad}
                  graficoDepresion={resumenGraficas.graficoDepresion}
                  graficoApgarFamiliar={resumenGraficas.graficoApgarFamiliar}
                  hayFiltrosActivos={resumenGraficas.hayFiltrosActivos}
                  hayPersonasFiltradas={resumenGraficas.hayPersonasFiltradas}
                  modulosGshs={modulosGshs}
                  resumenAlertaGshs={resumenAlertaGshs}
                  totalEvaluacionesGshs={totalEvaluacionesGshs}
                  loadingGshs={loadingGshs}
                  errorGshs={errorGshs}
                />
              </>
            )}
          </>
        )}

        {pestanaActiva === PESTANA_RESULTADOS && (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
                {error}
              </div>
            )}

            {!loading && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                <div className="flex-1 min-w-40">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                    Tipo de Institución
                  </label>
                  <select
                    value={filtroTipoInstitucion}
                    onChange={(e) => cambiarTipoInstitucion(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
                  >
                    <option value={FILTRO_TIPO_INSTITUCION_TODOS}>Todos los tipos</option>
                    {TIPOS_INSTITUCION.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                    {institucionesResultados.map(({ nombre }) => (
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

                <div className="flex-1 min-w-48">
                  <FiltroSeleccionMultiple
                    etiqueta="Formulario"
                    etiquetaTodos="Todos los formularios"
                    opciones={OPCIONES_INSTRUMENTO}
                    seleccionados={filtroInstrumentos}
                    onCambiar={setFiltroInstrumentos}
                  />
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
          </>
        )}

        {pestanaActiva === PESTANA_REPORTES_DOCENTES && (
          <PanelReportesInstitucion
            reportes={reportesDocente}
            cargando={loadingReportesDocente}
            error={errorReportesDocente}
          />
        )}
      </div>
    </div>
  );
}