// Pantalla principal de quien responde formularios. A partir de esta
// historia, se bifurca según el ROL real (useRolEvaluacion), leído una
// sola vez al montar:
//
//   - 'paciente' (Estudiante): EXACTAMENTE el mismo flujo de siempre,
//     sin ningún cambio — consentimiento/asentimiento
//     (useConsentimiento), los 6 formularios de siempre (TABS).
//   - 'persona_particular': flujo NUEVO y más simple —
//       1. Sin consentimiento/asentimiento. Decisión deliberada de esta
//          historia: el registro de Persona Particular pide "edad"
//          directamente (no fecha de nacimiento), que es justamente el
//          dato del que depende toda la lógica de useConsentimiento
//          (calcularEdad a partir de fecha_nacimiento); y ninguna de las
//          8 historias de este sprint pidió generar un documento de
//          consentimiento propio para este rol. Pendiente: si el
//          responsable clínico/legal considera que Persona Particular sí
//          debe firmar un consentimiento propio, es una historia nueva,
//          no una extensión de esta.
//       2. Solo sus 5 formularios (TABS_PERSONA_PARTICULAR): Estrés,
//          Ansiedad, Depresión, Cuidado Primario De Salud Familiar y
//          Riesgo Suicida — nunca Clima de Aula, GSHS ni Bullying.
//
// Por qué useConsentimiento() se sigue llamando siempre, aunque su
// resultado se ignore para Persona Particular: las Reglas de los Hooks
// exigen el mismo número de hooks en cada render de esta misma
// instancia — no se puede llamar condicionalmente según `rol`, que
// además solo se conoce después de la carga inicial (null -> valor).
// OJO: no se verificó en esta sesión que useConsentimiento() se
// comporte bien ante un usuario sin fecha_nacimiento (persona_particular
// nunca la tiene, ver arriba) — su resultado no se usa para este rol,
// pero conviene confirmar en consola que no tira ningún error de fondo
// antes de dar esta historia por cerrada.
import { useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import FormularioInstrumento from '../components/FormularioInstrumento';
import AvisoInstrumento from '../components/AvisoInstrumento';
import CapturaFechaNacimiento from '../components/consentimiento/CapturaFechaNacimiento';
import DocumentoConsentimiento from '../components/consentimiento/DocumentoConsentimiento';
import ConsentimientoDenegado from '../components/consentimiento/ConsentimientoDenegado';
import { useConsentimiento } from '../hooks/useConsentimiento';
import { useRolEvaluacion } from '../hooks/useRolEvaluacion';
import { INSTRUMENTO_CLIMA_AULA } from '../data/climaAulaData';
import { INSTRUMENTO_GSHS } from '../data/gshsData';
import { INSTRUMENTO_ESTRES } from '../data/estresData';
import { INSTRUMENTO_ANSIEDAD } from '../data/ansiedadData';
import { INSTRUMENTO_DEPRESION } from '../data/depresionData';
import { INSTRUMENTO_APGAR_FAMILIAR } from '../data/apgarFamiliarData';
import { INSTRUMENTO_RIESGO_SUICIDA } from '../data/riesgoSuicidaData';
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
                tabActiva === id ? acento.tabActivo : 'border-transparent text-gray-700 hover:text-gray-900'
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

  // Se sigue llamando siempre (ver nota de archivo sobre Reglas de los
  // Hooks); su resultado solo se usa cuando rol === 'paciente'.
  const {
    cargando: cargandoConsentimiento,
    error: errorConsentimiento,
    idPaciente: idPacienteConsentimiento,
    faltaFechaNacimiento,
    documentoRechazado,
    documentoPendiente,
    consentimientoCompleto,
    confirmarFechaNacimiento,
    decidirDocumento,
  } = useConsentimiento();

  const [tabActivaEstudiante, setTabActivaEstudiante] = useState(TABS[0].id);
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

  // ---- Rama PERSONA PARTICULAR: sin consentimiento, 5 formularios propios ----
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

  // ---- Rama ESTUDIANTE (rol 'paciente'): EXACTAMENTE el flujo de siempre ----
  if (cargandoConsentimiento) {
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

  if (errorConsentimiento) {
    return (
      <PantallaCentrada>
        <div className="max-w-md w-full p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
          {errorConsentimiento}
        </div>
      </PantallaCentrada>
    );
  }

  if (faltaFechaNacimiento) {
    return (
      <PantallaCentrada>
        <CapturaFechaNacimiento onConfirmar={confirmarFechaNacimiento} />
      </PantallaCentrada>
    );
  }

  if (documentoRechazado) {
    return (
      <PantallaCentrada>
        <ConsentimientoDenegado />
      </PantallaCentrada>
    );
  }

  if (!consentimientoCompleto && documentoPendiente) {
    return (
      <PantallaCentrada>
        <DocumentoConsentimiento
          contenido={documentoPendiente}
          onDecidir={(aceptado) => decidirDocumento(documentoPendiente.tipo, aceptado)}
        />
      </PantallaCentrada>
    );
  }

  return (
    <ContenidoTabs
      tabs={TABS}
      idPaciente={idPacienteConsentimiento}
      tabActiva={tabActivaEstudiante}
      setTabActiva={setTabActivaEstudiante}
      avisosAceptados={avisosAceptadosEstudiante}
      setAvisosAceptados={setAvisosAceptadosEstudiante}
      enviosConocidos={enviosConocidosEstudiante}
      setEnviosConocidos={setEnviosConocidosEstudiante}
    />
  );
}