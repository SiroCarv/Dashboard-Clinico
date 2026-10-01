// Pantalla principal de quien responde formularios. Se bifurca según el ROL
// real (useRolEvaluacion), leído una sola vez al montar:
//
//   - 'paciente' (Estudiante): ve SOLO los formularios de TABS que su
//     psicólogo/a habilitó para su institución (useFormulariosHabilitados).
//     Mientras no haya ninguno habilitado, ve una pantalla de espera.
//   - 'persona_particular': ve sus 5 formularios propios
//     (TABS_PERSONA_PARTICULAR) — nunca Clima de Aula, GSHS ni Bullying.
//
// Ninguno de los dos roles pasa ya por consentimiento/asentimiento: la
// prueba se aplica de forma presencial en aula, con el/la psicólogo/a, y
// esa autorización se gestiona fuera del sistema (decisión del cliente,
// 2026-10-01). El código anterior quedó solo en la rama de Git
// `backup/consentimiento-v1`, por si hay que restituirlo.
import { useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import FormularioInstrumento from '../components/FormularioInstrumento';
import AvisoInstrumento from '../components/AvisoInstrumento';
import { useRolEvaluacion } from '../hooks/useRolEvaluacion';
import { useFormulariosHabilitados } from '../hooks/useFormulariosHabilitados';
import { INSTRUMENTO_CLIMA_AULA } from '../data/climaAulaData';
import { INSTRUMENTO_GSHS } from '../data/gshsData';
import { INSTRUMENTO_ESTRES } from '../data/estresData';
import { INSTRUMENTO_ANSIEDAD } from '../data/ansiedadData';
import { INSTRUMENTO_DEPRESION } from '../data/depresionData';
import { INSTRUMENTO_APGAR_FAMILIAR } from '../data/apgarFamiliarData';
import { INSTRUMENTO_RIESGO_SUICIDA } from '../data/riesgoSuicidaData';
import { INSTRUMENTO_BULLYING } from '../data/bullyingData';
import { INFO_INSTRUMENTO } from '../data/infoInstrumentos';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

// Cada instrumento se identifica con su propio color de acento (ver
// paletaColores.js) para que el paciente distinga de un vistazo en cuál
// pestaña está parado.
const TABS = [
  {
    id: 'clima_aula',
    tipoInstrumento: 'CLIMA_AULA',
    etiqueta: 'Clima de Aula',
    instrumento: INSTRUMENTO_CLIMA_AULA,
    acento: COLOR_MARCA.tealAzulado,
  },
  {
    id: 'gshs',
    tipoInstrumento: 'GSHS',
    etiqueta: 'GSHS',
    instrumento: INSTRUMENTO_GSHS,
    acento: COLOR_MARCA.verdeMenta,
  },
  // Migrados desde el Observatorio de Salud Mental (SCRUM-54).
  {
    id: 'estres',
    tipoInstrumento: 'ESTRES',
    etiqueta: 'Estrés',
    instrumento: INSTRUMENTO_ESTRES,
    acento: COLOR_MARCA.celeste,
  },
  {
    id: 'ansiedad',
    tipoInstrumento: 'ANSIEDAD',
    etiqueta: 'Ansiedad',
    instrumento: INSTRUMENTO_ANSIEDAD,
    acento: COLOR_MARCA.indigo,
  },
  {
    id: 'depresion',
    tipoInstrumento: 'DEPRESION',
    etiqueta: 'Depresión',
    instrumento: INSTRUMENTO_DEPRESION,
    acento: COLOR_MARCA.fucsia,
  },
  // Agregado a pedido del cliente: instrumento nuevo, respondido por el
  // estudiante igual que los 5 anteriores.
  {
    id: 'apgar_familiar',
    tipoInstrumento: 'APGAR_FAMILIAR',
    etiqueta: 'Cuidado Primario De Salud Familiar',
    instrumento: INSTRUMENTO_APGAR_FAMILIAR,
    acento: COLOR_MARCA.rosa,
  },
  // NUEVO — historia "Cuestionario de Riesgo Suicida para Estudiantes":
  // mismo instrumento que ya usa Persona Particular (TABS_PERSONA_PARTICULAR
  // más abajo), mismo color de acento en toda la app. OJO: requiere que la
  // migración SQL de esta misma sesión (ampliar el CHECK de tipo_instrumento
  // en evaluaciones_instrumento) ya se haya corrido — si no, el envío falla.
  {
    id: 'riesgo_suicida',
    tipoInstrumento: 'RIESGO_SUICIDA',
    etiqueta: 'Riesgo Suicida',
    instrumento: INSTRUMENTO_RIESGO_SUICIDA,
    acento: COLOR_MARCA.purpura,
  },
  // NUEVO — historia "Cuestionario de Bullying para Estudiantes". Nunca
  // se agrega a TABS_PERSONA_PARTICULAR más abajo (ver nota del comentario
  // de archivo, arriba).
  {
    id: 'bullying',
    tipoInstrumento: 'BULLYING',
    etiqueta: 'Bullying',
    instrumento: INSTRUMENTO_BULLYING,
    acento: COLOR_MARCA.cian,
  },
];

// NUEVO — los 5 formularios exclusivos de Persona Particular (historia
// "Asignación de formularios según el tipo de persona"). Reutiliza los
// mismos 4 instrumentos ya compartidos con Estudiante (mismo color de
// acento en toda la app, por diseño) + Riesgo Suicida, nuevo.
const TABS_PERSONA_PARTICULAR = [
  {
    id: 'estres',
    tipoInstrumento: 'ESTRES',
    etiqueta: 'Estrés',
    instrumento: INSTRUMENTO_ESTRES,
    acento: COLOR_MARCA.celeste,
  },
  {
    id: 'ansiedad',
    tipoInstrumento: 'ANSIEDAD',
    etiqueta: 'Ansiedad',
    instrumento: INSTRUMENTO_ANSIEDAD,
    acento: COLOR_MARCA.indigo,
  },
  {
    id: 'depresion',
    tipoInstrumento: 'DEPRESION',
    etiqueta: 'Depresión',
    instrumento: INSTRUMENTO_DEPRESION,
    acento: COLOR_MARCA.fucsia,
  },
  {
    id: 'apgar_familiar',
    tipoInstrumento: 'APGAR_FAMILIAR',
    etiqueta: 'Cuidado Primario De Salud Familiar',
    instrumento: INSTRUMENTO_APGAR_FAMILIAR,
    acento: COLOR_MARCA.rosa,
  },
  {
    id: 'riesgo_suicida',
    tipoInstrumento: 'RIESGO_SUICIDA',
    etiqueta: 'Riesgo Suicida',
    instrumento: INSTRUMENTO_RIESGO_SUICIDA,
    acento: COLOR_MARCA.purpura,
  },
];

function PantallaCentrada({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />
      <BarraSuperior titulo="Observatorio de Salud Mental" />
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">{children}</div>
    </div>
  );
}

function ContenidoTabs({ tabs, idPaciente, tabActiva, setTabActiva, avisosAceptados, setAvisosAceptados, enviosConocidos, setEnviosConocidos }) {
  const tab = tabs.find((t) => t.id === tabActiva) ?? tabs[0];
  const avisoAceptado = avisosAceptados.has(tab.id);
  const yaEnviadoConocido = enviosConocidos[tab.id]; // undefined | true | false

  const aceptarAviso = () => {
    setAvisosAceptados((prev) => new Set(prev).add(tab.id));
  };

  const notificarEstadoInstrumento = (tabId, { yaEnviado }) => {
    setEnviosConocidos((prev) => (prev[tabId] === yaEnviado ? prev : { ...prev, [tabId]: yaEnviado }));
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Observatorio de Salud Mental" />

      {!avisoAceptado && yaEnviadoConocido === false && (
        <AvisoInstrumento
          titulo={tab.instrumento.titulo}
          info={INFO_INSTRUMENTO[tab.id]}
          acento={tab.acento}
          onAceptar={aceptarAviso}
        />
      )}

      <div className="relative z-10 p-6 md:p-10 max-w-3xl mx-auto">
        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
          {tabs.map(({ id, etiqueta, acento }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTabActiva(id)}
              className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
                tab.id === id ? acento.tabActivo : 'border-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        <FormularioInstrumento
          key={tab.id}
          idPaciente={idPaciente}
          tipoInstrumento={tab.tipoInstrumento}
          instrumento={tab.instrumento}
          acento={tab.acento}
          onEstadoListo={(estado) => notificarEstadoInstrumento(tab.id, estado)}
        />
      </div>
    </div>
  );
}

export default function Encuesta() {
  const { rol, idUsuario, cargando: cargandoRol } = useRolEvaluacion();

  // Solo se consulta para estudiantes; Persona Particular no depende de
  // habilitación.
  const {
    habilitados,
    cargando: cargandoHabilitados,
    error: errorHabilitados,
    recargar: recargarHabilitados,
  } = useFormulariosHabilitados(rol === 'paciente');

  const [tabActivaEstudiante, setTabActivaEstudiante] = useState(null);
  const [avisosAceptadosEstudiante, setAvisosAceptadosEstudiante] = useState(() => new Set());
  const [enviosConocidosEstudiante, setEnviosConocidosEstudiante] = useState({});

  const [tabActivaParticular, setTabActivaParticular] = useState(TABS_PERSONA_PARTICULAR[0].id);
  const [avisosAceptadosParticular, setAvisosAceptadosParticular] = useState(() => new Set());
  const [enviosConocidosParticular, setEnviosConocidosParticular] = useState({});

  if (cargandoRol) {
    return (
      <PantallaCentrada>
        <div className="flex flex-col items-center gap-3 text-gray-700 font-semibold">
          <svg className="animate-spin h-8 w-8 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      </PantallaCentrada>
    );
  }

  // ---- Rama PERSONA PARTICULAR: 5 formularios propios ----
  if (rol === 'persona_particular') {
    return (
      <ContenidoTabs
        tabs={TABS_PERSONA_PARTICULAR}
        idPaciente={idUsuario}
        tabActiva={tabActivaParticular}
        setTabActiva={setTabActivaParticular}
        avisosAceptados={avisosAceptadosParticular}
        setAvisosAceptados={setAvisosAceptadosParticular}
        enviosConocidos={enviosConocidosParticular}
        setEnviosConocidos={setEnviosConocidosParticular}
      />
    );
  }

  // ---- Rama ESTUDIANTE (rol 'paciente'): solo formularios habilitados ----
  if (cargandoHabilitados) {
    return (
      <PantallaCentrada>
        <div className="flex flex-col items-center gap-3 text-gray-700 font-semibold">
          <svg className="animate-spin h-8 w-8 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      </PantallaCentrada>
    );
  }

  const tabsEstudiante = TABS.filter((t) => habilitados.has(t.tipoInstrumento));

  if (tabsEstudiante.length === 0) {
    return (
      <PantallaCentrada>
        <div className="max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl text-center">
          {errorHabilitados && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
              {errorHabilitados}
            </div>
          )}
          <h2 className="text-3xl font-extrabold text-black">Todo listo</h2>
          <p className="text-gray-500 mt-2 font-medium">
            Tu psicólogo/a aún no habilitó ningún formulario. Cuando lo haga, aparecerá aquí.
          </p>
          <button
            type="button"
            onClick={recargarHabilitados}
            className="mt-6 w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide bg-violet-400 hover:bg-violet-500"
          >
            Actualizar
          </button>
        </div>
      </PantallaCentrada>
    );
  }

  return (
    <ContenidoTabs
      tabs={tabsEstudiante}
      idPaciente={idUsuario}
      tabActiva={tabActivaEstudiante}
      setTabActiva={setTabActivaEstudiante}
      avisosAceptados={avisosAceptadosEstudiante}
      setAvisosAceptados={setAvisosAceptadosEstudiante}
      enviosConocidos={enviosConocidosEstudiante}
      setEnviosConocidos={setEnviosConocidosEstudiante}
    />
  );
}