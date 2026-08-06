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
import { INFO_INSTRUMENTO } from '../data/infoInstrumentos';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

// Historia "Consentimiento y asentimiento informado por edad" +
// "Aviso informativo por instrumento" + "Paginación de formularios en
// bloques de 10" + "Envío individual de resultados por instrumento".
//
// Reemplaza al modo solo-lectura de SCRUM-30: ahora, una vez completado
// el consentimiento que corresponda según la edad, el paciente puede
// responder y enviar Clima de Aula y GSHS de forma independiente entre sí.
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
];

function PantallaCentrada({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
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

  if (cargando) {
    return (
      <PantallaCentrada>
        <div className="flex flex-col items-center gap-3 text-gray-500 font-medium">
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

  const aceptarAviso = () => {
    setAvisosAceptados((prev) => new Set(prev).add(tab.id));
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Imagen de fondo institucional, compartida con el resto de la plataforma */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Observatorio de Salud Mental" />

      {!avisoAceptado && (
        <div className="relative z-10">
          <AvisoInstrumento
            titulo={tab.instrumento.titulo}
            info={INFO_INSTRUMENTO[tab.id]}
            acento={tab.acento}
            onAceptar={aceptarAviso}
          />
        </div>
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
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
        />
      </div>
    </div>
  );
}