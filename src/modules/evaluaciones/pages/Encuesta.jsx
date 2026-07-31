import { useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import VistaInstrumentoSoloLectura from '../components/VistaInstrumentoSoloLectura';
import { INSTRUMENTO_CLIMA_AULA } from '../data/climaAulaData';
import { INSTRUMENTO_GSHS } from '../data/gshsData';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';

// Reemplazo del PHQ-9 (historia SCRUM-30): el paciente ya no completa el
// PHQ-9 aquí. Ve el Cuestionario de Clima de Aula y la Encuesta GSHS en
// modo de solo lectura — todavía no se puede responder ni enviar nada; el
// cálculo y el guardado se definirán con el cliente en una historia
// posterior. El flujo anterior (AvisoConsentimiento, PreguntaEncuesta,
// EncuestaExitosa, EvaluacionYaRealizada, useEncuestaClinica,
// PREGUNTAS_ENCUESTA) queda intacto en el código pero sin usar, por si se
// reutiliza su patrón de UI cuando exista la historia de captura real.
// evaluacionesService.js NO se toca: el Dashboard del psicólogo sigue
// dependiendo de él para leer las evaluaciones PHQ-9 ya guardadas.

// Historia "Paleta de colores institucional": cada instrumento tiene su
// propio color de acento (uno de los 4 colores de marca), para que el
// paciente distinga de un vistazo cuál está viendo. El PHQ-9 real (fuera
// de estas pestañas) conserva el naranja institucional sin cambios.
const TABS = [
  {
    id: 'clima_aula',
    etiqueta: 'Clima de Aula',
    instrumento: INSTRUMENTO_CLIMA_AULA,
    acento: COLOR_MARCA.tealAzulado,
  },
  {
    id: 'gshs',
    etiqueta: 'GSHS',
    instrumento: INSTRUMENTO_GSHS,
    acento: COLOR_MARCA.verdeMenta,
  },
];

export default function Encuesta() {
  const [tabActiva, setTabActiva] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === tabActiva) ?? TABS[0];

  return (
    <div className="min-h-screen bg-gray-100">
      <BarraSuperior titulo="Evaluación Psicológica (Paciente)" />

      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded-md text-center shadow-sm">
          <p className="font-bold">Estos formularios están en proceso de habilitación.</p>
          <p className="text-sm mt-1">
            Por ahora solo puedes revisarlos. Tu psicólogo te avisará cuándo podrás responderlos.
          </p>
        </div>

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

        <VistaInstrumentoSoloLectura instrumento={tab.instrumento} acento={tab.acento} />
      </div>
    </div>
  );
}