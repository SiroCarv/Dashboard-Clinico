// Panel principal del psicólogo: panel de indicadores (cuántas personas
// completaron cada formulario, con filtros por perfil) + listado de
// pacientes con búsqueda por nombre/correo, filtro por institución,
// filtro por tipo de persona (Estudiante/Docente — SCRUM-53), filtro por
// curso/paralelo/turno (SCRUM-59) y exportación a Excel.
//
// El Dashboard dejó de tener 2 pestañas (Clima de Aula/GSHS + "Historial
// anterior PHQ-9"). La pantalla de historial PHQ-9 y su ruta de detalle
// se retiraron por completo — decisión explícita del cliente. La vista
// principal es el listado de pacientes; buscar/filtrar/exportar se
// aplican sobre ese listado, no sobre evaluaciones puntuales (eso vive en
// InformeConsolidado.jsx, al hacer clic en una fila). El panel de
// indicadores de arriba usa su propio filtro independiente
// (useResumenFormularios) — a propósito no comparte estado con el
// buscador/filtro de la tabla de abajo: cuentan cosas distintas
// (personas que cumplen un perfil, vs. filas visibles en la tabla). Por
// eso curso/paralelo/turno se repiten acá como filtro propio de la
// tabla, en vez de reutilizar los que ya calcula useResumenFormularios.
//
// Curso/paralelo/turno (SCRUM-59): las 3 opciones son listas fijas, no
// derivadas de `pacientes` como hace useResumenFormularios — el criterio
// de aceptación pide que las 6 opciones de curso, las 10 de paralelo (A
// a la J) y las 2 de turno estén siempre disponibles, aunque hoy no haya
// ningún estudiante matriculado en, por ejemplo, el paralelo "H". Los
// valores de curso/turno coinciden exactamente con las opciones reales
// de registro (autenticacion/pages/Registro.jsx: OPCIONES_CURSO/
// OPCIONES_TURNO); paralelo es una decisión explícita del cliente para
// que el filtro cubra el rango completo A-J aunque el registro real solo
// permita A-F por ahora. Se duplican acá en vez de importarse desde
// `autenticacion` (ningún módulo puede importar de otro) — mismo
// criterio de duplicación consciente que ya usa gshsData.js.
//
// Barra de búsqueda/filtro de la tabla (línea ~225): usa `flex-wrap` a
// partir de `sm:` para que los campos que no entren en el ancho
// disponible pasen a una segunda línea. Sin eso, en anchos intermedios
// los 6 elementos (buscador + 4 selects + botón) se desbordaban y
// quedaban recortados por el `overflow-hidden` del contenedor raíz de
// la página, en vez de mostrarse en una fila adicional.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useListaPacientes } from '../hooks/useListaPacientes';
import { useResumenFormularios } from '../hooks/useResumenFormularios';
import { TablaPacientes } from '../components/TablaPacientes';
import { ResumenFormularios } from '../components/ResumenFormularios';
import { FiltrosResumen } from '../components/FiltrosResumen';
import { exportarPacientesAExcel } from '../utils/exportarPacientesExcel';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

const FILTRO_INSTITUCION_TODAS = 'todas';

// Opciones del filtro "tipo de persona" (SCRUM-53): distinguen quién
// originó el registro (autoenvío del estudiante vs. caso registrado por
// un docente en su nombre). Los valores coinciden exactamente con
// `tipoPersona` tal como lo devuelve pacientesService.js.
const FILTRO_TIPO_PERSONA_TODOS = 'todos';
const FILTRO_TIPO_PERSONA_ESTUDIANTE = 'estudiante';
const FILTRO_TIPO_PERSONA_DOCENTE = 'docente';

// SCRUM-59 — listas fijas (ver nota de cabecera sobre por qué no se
// derivan de `pacientes` ni se importan de `autenticacion`).
const FILTRO_ESCOLAR_TODOS = 'todos';
const OPCIONES_CURSO = [
  '1ro de Secundaria',
  '2do de Secundaria',
  '3ro de Secundaria',
  '4to de Secundaria',
  '5to de Secundaria',
  '6to de Secundaria',
];
const OPCIONES_PARALELO = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const OPCIONES_TURNO = ['Mañana', 'Tarde'];

export default function Dashboard() {
  const { pacientes, loading, error } = useListaPacientes();
  const resumen = useResumenFormularios(pacientes);
  const [busqueda, setBusqueda] = useState('');
  const [filtroInstitucion, setFiltroInstitucion] = useState(FILTRO_INSTITUCION_TODAS);
  const [filtroTipoPersona, setFiltroTipoPersona] = useState(FILTRO_TIPO_PERSONA_TODOS);
  const [filtroCurso, setFiltroCurso] = useState(FILTRO_ESCOLAR_TODOS);
  const [filtroParalelo, setFiltroParalelo] = useState(FILTRO_ESCOLAR_TODOS);
  const [filtroTurno, setFiltroTurno] = useState(FILTRO_ESCOLAR_TODOS);
  const [exportando, setExportando] = useState(false);

  // Instituciones únicas derivadas de los pacientes ya cargados: no se
  // necesita ninguna llamada nueva a Supabase ni un import cruzado al
  // módulo `instituciones` para poblar este filtro.
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

      // Sin filtro: se ve todo, sin distinción (criterio de aceptación
      // SCRUM-53). Con un filtro específico elegido: una persona sin
      // ninguna evaluación (`tipoPersona === null`) no coincide con
      // ninguna opción, así que queda fuera de ambos — no es "un
      // registro de estudiante" ni "un registro hecho por un docente".
      const coincideTipoPersona =
        filtroTipoPersona === FILTRO_TIPO_PERSONA_TODOS || p.tipoPersona === filtroTipoPersona;

      // SCRUM-59 — un Consultante particular (sin institución) nunca
      // tiene curso/paralelo/turno, así que si el psicólogo elige un
      // valor específico acá, esas filas quedan fuera sin necesidad de
      // ningún caso especial: p.curso/paralelo/turno son `null` y nunca
      // coinciden con un valor elegido.
      const coincideCurso = filtroCurso === FILTRO_ESCOLAR_TODOS || p.curso === filtroCurso;
      const coincideParalelo = filtroParalelo === FILTRO_ESCOLAR_TODOS || p.paralelo === filtroParalelo;
      const coincideTurno = filtroTurno === FILTRO_ESCOLAR_TODOS || p.turno === filtroTurno;

      return (
        coincideInstitucion &&
        coincideBusqueda &&
        coincideTipoPersona &&
        coincideCurso &&
        coincideParalelo &&
        coincideTurno
      );
    });
  }, [
    pacientes,
    busqueda,
    filtroInstitucion,
    filtroTipoPersona,
    filtroCurso,
    filtroParalelo,
    filtroTurno,
  ]);

  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    filtroInstitucion !== FILTRO_INSTITUCION_TODAS ||
    filtroTipoPersona !== FILTRO_TIPO_PERSONA_TODOS ||
    filtroCurso !== FILTRO_ESCOLAR_TODOS ||
    filtroParalelo !== FILTRO_ESCOLAR_TODOS ||
    filtroTurno !== FILTRO_ESCOLAR_TODOS;

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroInstitucion(FILTRO_INSTITUCION_TODAS);
    setFiltroTipoPersona(FILTRO_TIPO_PERSONA_TODOS);
    setFiltroCurso(FILTRO_ESCOLAR_TODOS);
    setFiltroParalelo(FILTRO_ESCOLAR_TODOS);
    setFiltroTurno(FILTRO_ESCOLAR_TODOS);
  };

  // Recibe `pacientesFiltrados` -no `pacientes`- a propósito: el archivo
  // debe reflejar exactamente lo que el psicólogo ve en pantalla tras
  // aplicar búsqueda/filtros, nunca el padrón completo.
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
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-black">Dashboard Clínico</h2>
            <p className="text-gray-700 mt-1 font-semibold">
              Seguimiento consolidado del estado clínico de tus participantes y consultantes.
            </p>
          </div>
          {/* Resultados del GSHS por módulo (SCRUM-57) */}
          <Link
            to="/dashboard/gshs"
            className="flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold shadow-sm transition-colors bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Ver resultados del GSHS
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <FiltrosResumen
              filtros={resumen.filtros}
              actualizarFiltro={resumen.actualizarFiltro}
              limpiarFiltros={resumen.limpiarFiltros}
              hayFiltrosActivos={resumen.hayFiltrosActivos}
              instituciones={resumen.instituciones}
              generos={resumen.generos}
              cursos={resumen.cursos}
              paralelos={resumen.paralelos}
              turnos={resumen.turnos}
              mostrarFiltrosEscolares={resumen.mostrarFiltrosEscolares}
              tramosEdad={resumen.tramosEdad}
            />
            <ResumenFormularios
              graficoClimaAula={resumen.graficoClimaAula}
              graficoGshs={resumen.graficoGshs}
              hayFiltrosActivos={resumen.hayFiltrosActivos}
              hayPersonasFiltradas={resumen.hayPersonasFiltradas}
            />
          </>
        )}

        {!loading && pacientes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
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

            <select
              value={filtroTipoPersona}
              onChange={(e) => setFiltroTipoPersona(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
            >
              <option value={FILTRO_TIPO_PERSONA_TODOS}>Todos los tipos</option>
              <option value={FILTRO_TIPO_PERSONA_ESTUDIANTE}>Estudiante</option>
              <option value={FILTRO_TIPO_PERSONA_DOCENTE}>Docente</option>
            </select>

            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
            >
              <option value={FILTRO_ESCOLAR_TODOS}>Todos los cursos</option>
              {OPCIONES_CURSO.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>

            <select
              value={filtroParalelo}
              onChange={(e) => setFiltroParalelo(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
            >
              <option value={FILTRO_ESCOLAR_TODOS}>Todos los paralelos</option>
              {OPCIONES_PARALELO.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>

            <select
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
            >
              <option value={FILTRO_ESCOLAR_TODOS}>Todos los turnos</option>
              {OPCIONES_TURNO.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>

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