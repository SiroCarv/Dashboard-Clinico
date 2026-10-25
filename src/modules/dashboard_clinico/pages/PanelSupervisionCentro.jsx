// Panel de supervisión del Jefe/a o Director/a de un Centro de Salud
// (rol 'jefe_centro'). Pestañas, en este orden: "Equipo" (los
// psicólogos/as del centro: nombre, turno y correo), "Gráficas" (los
// mismos indicadores del Dashboard del psicólogo, calculados con todas las
// personas del centro) y "Personas Particulares" (listado con acceso al
// informe individual).
//
// Por qué se arma con las mismas piezas que Dashboard.jsx: el jefe/a ve lo
// mismo que ve un psicólogo del centro, pero sin habilitar formularios ni
// gestionar casos. Las políticas RLS del jefe/a (ver SQL de esta historia)
// ya limitan cada consulta a su centro, así que useListaPacientes y
// useResumenFormularios se reutilizan tal cual: cero lógica de filtrado
// por centro en el cliente. Los formularios de un centro de salud son
// siempre los de Persona Particular, por eso ResumenFormularios recibe
// `soloPersonaParticular` fijo en true (no hace falta resolver el tipo de
// institución como en el Dashboard).
//
// Sin métricas por psicólogo (decisión de la cliente): la pestaña Equipo
// es solo la lista del personal. Los gráficos son del centro completo.
//
// Sin Excel (la cliente no lo pidió): a propósito no hay botón de
// exportación en ninguna pestaña.
//
// Cuenta sin centro: si el centro del/la jefe/a fue eliminado, la base
// deja su cuenta sin centro. En ese caso se muestra un aviso y ninguna
// pestaña, en vez de tablas vacías que parezcan un centro sin actividad.
//
// Realtime: useListaPacientes ya se suscribe a nuevas evaluaciones; la
// base solo le entrega los eventos de personas de su centro (RLS).
import { useMemo, useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useListaPacientes } from '../hooks/useListaPacientes';
import { useResumenFormularios } from '../hooks/useResumenFormularios';
import { useSupervisionCentro } from '../hooks/useSupervisionCentro';
import { BadgeInstitucion } from '../components/BadgeInstitucion';
import { TablaEquipoCentro } from '../components/TablaEquipoCentro';
import { TablaPersonasParticulares } from '../components/TablaPersonasParticulares';
import { ResumenFormularios } from '../components/ResumenFormularios';
import { FiltrosResumen } from '../components/FiltrosResumen';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

const PESTANA_EQUIPO = 'equipo';
const PESTANA_GRAFICAS = 'graficas';
const PESTANA_PERSONAS_PARTICULARES = 'personas_particulares';

// Ruta del informe individual del jefe/a (App.jsx). Es distinta de la del
// psicólogo porque RutaProtegida exige un rol exacto por ruta.
const RUTA_BASE_INFORME = '/supervision-centro/informe-particular';

const PESTANAS = [
  { id: PESTANA_EQUIPO, etiqueta: 'Equipo' },
  { id: PESTANA_GRAFICAS, etiqueta: 'Gráficas' },
  { id: PESTANA_PERSONAS_PARTICULARES, etiqueta: 'Personas Particulares' },
];

function Cargando({ texto }) {
  return (
    <div className="flex flex-col justify-center items-center py-20 gap-3">
      <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span className="text-gray-700 font-semibold">{texto}</span>
    </div>
  );
}

export default function PanelSupervisionCentro() {
  const { centro, equipo, loading: loadingCentro, error: errorCentro } = useSupervisionCentro();
  const { pacientes, loading: loadingPacientes, error: errorPacientes } = useListaPacientes();
  const resumen = useResumenFormularios(pacientes);

  const [pestanaActiva, setPestanaActiva] = useState(PESTANA_EQUIPO);
  const [busqueda, setBusqueda] = useState('');

  // Un centro de salud solo tiene Personas Particulares; se filtra por rol
  // igual que el Dashboard por si algún día convive otro perfil.
  const personasParticulares = useMemo(
    () => pacientes.filter((p) => p.rol === 'persona_particular'),
    [pacientes]
  );

  const personasParticularesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return personasParticulares.filter((p) => texto === '' || p.nombre?.toLowerCase().includes(texto));
  }, [personasParticulares, busqueda]);

  const sinCentro = !loadingCentro && !errorCentro && !centro;
  const error = errorCentro || errorPacientes;

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Panel de Supervisión (Jefe/a de Centro)" />

      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="text-2xl font-extrabold text-black">Supervisión del Centro</h2>
            <BadgeInstitucion nombre={centro?.nombre ?? null} cargando={loadingCentro} error={errorCentro} />
          </div>
          <p className="text-gray-700 mt-1 font-semibold">
            Equipo de psicólogos/as y seguimiento de las personas de tu centro de salud.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {sinCentro && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            <p className="font-bold">⚠️ Tu cuenta no tiene un centro de salud asignado</p>
            <p className="text-sm mt-1">Contacta al administrador de la plataforma para que te vincule a tu centro.</p>
          </div>
        )}

        {loadingCentro || loadingPacientes ? (
          <Cargando texto="Cargando información del centro..." />
        ) : sinCentro ? null : (
          <>
            <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
              {PESTANAS.map((pestana) => (
                <button
                  key={pestana.id}
                  type="button"
                  onClick={() => setPestanaActiva(pestana.id)}
                  className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
                    pestanaActiva === pestana.id
                      ? COLOR_MARCA.violetaSuave.tabActivo
                      : 'border-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {pestana.etiqueta}
                </button>
              ))}
            </div>

            {pestanaActiva === PESTANA_EQUIPO && <TablaEquipoCentro equipo={equipo} />}

            {pestanaActiva === PESTANA_GRAFICAS && (
              <>
                <FiltrosResumen
                  filtros={resumen.filtros}
                  actualizarFiltro={resumen.actualizarFiltro}
                  limpiarFiltros={resumen.limpiarFiltros}
                  hayFiltrosActivos={resumen.hayFiltrosActivos}
                  generos={resumen.generos}
                  cursos={resumen.cursos}
                  paralelos={resumen.paralelos}
                  turnos={resumen.turnos}
                  tramosEdad={resumen.tramosEdad}
                />
                <ResumenFormularios
                  graficoClimaAula={resumen.graficoClimaAula}
                  graficoEstres={resumen.graficoEstres}
                  graficoAnsiedad={resumen.graficoAnsiedad}
                  graficoDepresion={resumen.graficoDepresion}
                  graficoApgarFamiliar={resumen.graficoApgarFamiliar}
                  graficoRiesgoSuicida={resumen.graficoRiesgoSuicida}
                  graficoBullying={resumen.graficoBullying}
                  hayFiltrosActivos={resumen.hayFiltrosActivos}
                  hayPersonasFiltradas={resumen.hayPersonasFiltradas}
                  soloPersonaParticular
                />
              </>
            )}

            {pestanaActiva === PESTANA_PERSONAS_PARTICULARES && (
              <>
                {personasParticulares.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
                    />
                  </div>
                )}

                <TablaPersonasParticulares
                  personas={personasParticularesFiltradas}
                  hayFiltrosActivos={busqueda.trim() !== ''}
                  rutaBaseInforme={RUTA_BASE_INFORME}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
