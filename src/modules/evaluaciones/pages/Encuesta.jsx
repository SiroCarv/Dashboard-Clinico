import BarraSuperior from '../../../shared/components/BarraSuperior';
import AvisoConsentimiento from '../components/AvisoConsentimiento';
import PreguntaEncuesta from '../components/PreguntaEncuesta';
import EncuestaExitosa from '../components/EncuestaExitosa';
import EvaluacionYaRealizada from '../components/EvaluacionYaRealizada';
import { useEncuestaClinica, PASOS_ENCUESTA } from '../hooks/useEncuestaClinica';
import { PREGUNTAS_ENCUESTA } from '../data/preguntasEncuesta';

export default function Encuesta() {
  const {
    paso,
    aceptaConsentimiento,
    setAceptaConsentimiento,
    comenzarEvaluacion,
    respuestas,
    seleccionarRespuesta,
    enviarEncuesta,
    error,
    enviando,
    fechaEvaluacionPrevia,
  } = useEncuestaClinica();

  return (
    <div className="min-h-screen bg-gray-100">
      <BarraSuperior titulo="Evaluación Psicológica (Paciente)" />

      <div className="flex items-center justify-center p-4 py-10">
        {paso === PASOS_ENCUESTA.VERIFICANDO && (
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-500 font-medium">Verificando tu estado...</span>
          </div>
        )}

        {paso === PASOS_ENCUESTA.YA_RESPONDIO && (
          <EvaluacionYaRealizada fecha={fechaEvaluacionPrevia} />
        )}

        {paso === PASOS_ENCUESTA.CONSENTIMIENTO && (
          <AvisoConsentimiento
            acepta={aceptaConsentimiento}
            onCambiarAcepta={setAceptaConsentimiento}
            onContinuar={comenzarEvaluacion}
          />
        )}

        {paso === PASOS_ENCUESTA.FORMULARIO && (
          <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-black">Evaluación</h2>
              <p className="text-gray-500 mt-2 font-medium">Responde cada pregunta con sinceridad</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={enviarEncuesta} className="space-y-6">
              {PREGUNTAS_ENCUESTA.map((pregunta, i) => (
                <PreguntaEncuesta
                  key={pregunta.id}
                  pregunta={pregunta}
                  indice={i + 1}
                  valorSeleccionado={respuestas[pregunta.id]}
                  onSeleccionar={seleccionarRespuesta}
                />
              ))}

              <button
                type="submit"
                disabled={enviando}
                className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
                  enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {enviando ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar Evaluación'
                )}
              </button>
            </form>
          </div>
        )}

        {paso === PASOS_ENCUESTA.ENVIADA && <EncuestaExitosa />}
      </div>
    </div>
  );
}