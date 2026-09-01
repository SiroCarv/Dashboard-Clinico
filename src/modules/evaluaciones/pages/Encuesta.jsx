// Pantalla principal del paciente. Orquesta, en orden, todo lo que debe
// pasar antes de dejarlo responder un instrumento:
//   1. useConsentimiento() decide si falta fecha de nacimiento, si hay un
//      documento de consentimiento pendiente o rechazado, o si ya está
//      todo aceptado (ver comentario completo en useConsentimiento.js).
//   2. Una vez completo el consentimiento, se muestran 2 pestañas —
//      Clima de Aula y GSHS— que el paciente puede responder en el orden
//      que quiera y de forma independiente entre sí (completar una no
//      obliga a completar la otra en el momento).
//   3. Antes de ver las preguntas de una pestaña por primera vez,
//      aparece un aviso informativo (AvisoInstrumento) que hay que
//      aceptar — se recuerda por pestaña durante la sesión
//      (`avisosAceptados`), no queda guardado en el servidor. Tampoco se
//      muestra si el instrumento ya fue enviado antes: FormularioInstrumento
//      avisa ese estado hacia acá vía `onEstadoListo` apenas lo confirma
//      contra la base de datos (`enviosConocidos`).
//   4. FormularioInstrumento hace el trabajo pesado real: paginación,
//      validación de "todo respondido" y el envío en sí.
//
// Barra superior en pantallas previas (corrección — bug reportado por el
// cliente: "no aparece la barra de cerrar sesión cuando pide fecha de
// nacimiento, y cuando sale el consentimiento"): la barra solo estaba
// montada en el return final (el formulario en sí). PantallaCentrada, el
// wrapper que usan las 4 pantallas previas (cargando, error, fecha de
// nacimiento, consentimiento pendiente/rechazado), no la incluía. Se
// resolvió agregándola directo a PantallaCentrada en vez de repetirla en
// cada return: cubre las 2 pantallas reportadas y, de paso, corrige el
// mismo problema en "cargando", "error" y "consentimiento rechazado" —
// mismo bug de raíz en los 5 casos, así que no tenía sentido dejar 3 de
// los 5 sin corregir.
import { useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import FormularioInstrumento from '../components/FormularioInstrumento';
import AvisoInstrumento from '../components/AvisoInstrumento';
import CapturaFechaNacimiento from '../components/consentimiento/CapturaFechaNacimiento';
import DocumentoConsentimiento from '../components/consentimiento/DocumentoConsentimiento';
import ConsentimientoDenegado from '../components/consentimiento/ConsentimientoDenegado';
import { useConsentimiento } from '../hooks/useConsentimiento';
import { INSTRUMENTO_CLIMA_AULA } from '../data/climaAulaData';
import { INSTRUMENTO_GSHS } from '../data/gshsData';
import { INSTRUMENTO_ESTRES } from '../data/estresData';
import { INSTRUMENTO_ANSIEDAD } from '../data/ansiedadData';
import { INSTRUMENTO_DEPRESION } from '../data/depresionData';
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

export default function Encuesta() {
  const {
    cargando,
    error,
    idPaciente,
    faltaFechaNacimiento,
    documentoRechazado,
    documentoPendiente,
    consentimientoCompleto,
    confirmarFechaNacimiento,
    decidirDocumento,
  } = useConsentimiento();

  const [tabActiva, setTabActiva] = useState(TABS[0].id);
  const [avisosAceptados, setAvisosAceptados] = useState(() => new Set());
  // { [tabId]: boolean } — undefined mientras no se sabe todavía si esa
  // pestaña ya fue enviada antes (ver comentario de arriba).
  const [enviosConocidos, setEnviosConocidos] = useState({});

  if (cargando) {
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

  if (error) {
    return (
      <PantallaCentrada>
        <div className="max-w-md w-full p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
          {error}
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

  const tab = TABS.find((t) => t.id === tabActiva) ?? TABS[0];
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
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
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
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map(({ id, etiqueta, acento }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTabActiva(id)}
              className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
                tabActiva === id
                  ? acento.tabActivo
                  : 'border-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        {/* key={tab.id} es intencional: sin esto, React reutiliza la
            misma instancia de FormularioInstrumento al cambiar de pestaña
            y arrastra su estado interno (error, página, respuestas) del
            instrumento anterior — por ejemplo, un error de envío de
            Clima de Aula seguía apareciendo al saltar a GSHS. */}
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