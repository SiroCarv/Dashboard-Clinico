import { useParams, useNavigate } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useDetalleEvaluacion } from '../hooks/useDetalleEvaluacion';
import { ESCALA_RESPUESTA } from '../../evaluaciones';

const ESTILOS_DIAGNOSTICO = {
  Leve: 'bg-green-50 border-green-200 text-green-800',
  Moderado: 'bg-gray-100 border-gray-300 text-gray-800',
  Severo: 'bg-red-50 border-red-200 text-red-800',
};

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Traduce el valor numérico (0-3) guardado en cada respuesta al texto de
// la escala Likert (misma fuente de verdad que usa el paciente al
// responder la encuesta, expuesta por el módulo `evaluaciones`).
function textoDeRespuesta(valor) {
  return ESCALA_RESPUESTA.find((opcion) => opcion.valor === valor)?.texto ?? '—';
}

export default function DetalleClinico() {
  const { idEvaluacion } = useParams();
  const navigate = useNavigate();
  const { evaluacion, loading, error, noEncontrada } = useDetalleEvaluacion(idEvaluacion);

  return (
    <div className="min-h-screen bg-gray-100">
      <BarraSuperior titulo="Detalle Clínico de la Evaluación" />

      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver al Dashboard
        </button>

        {loading && (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-500 font-medium">Cargando evaluación...</span>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && noEncontrada && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            <p className="font-bold">⚠️ Evaluación no encontrada</p>
            <p className="text-sm mt-1">
              No existe o no tienes acceso a esta evaluación.
            </p>
          </div>
        )}

        {!loading && !error && !noEncontrada && evaluacion && (
          <div className="space-y-6">
            {/* Encabezado clínico: paciente, institución, fecha, puntaje, diagnóstico */}
            <div className="bg-white rounded-lg shadow-xl border-t-8 border-orange-500 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-black">
                    {evaluacion.paciente?.nombre || evaluacion.paciente?.email || 'Paciente desconocido'}
                  </h2>
                  <p className="text-gray-500 mt-1 font-medium">
                    {evaluacion.paciente?.institucion?.nombre || '—'}
                  </p>
                  <p className="text-gray-500 mt-1 text-sm">
                    Evaluación registrada el {formatearFecha(evaluacion.fecha_registro)}
                  </p>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
                    Puntaje total
                  </p>
                  <p className="text-3xl font-extrabold text-black">{evaluacion.puntaje_total}</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 border rounded-full text-sm font-semibold ${
                      ESTILOS_DIAGNOSTICO[evaluacion.diagnostico] ||
                      'bg-gray-100 border-gray-300 text-gray-800'
                    }`}
                  >
                    {evaluacion.diagnostico}
                  </span>
                </div>
              </div>

              {evaluacion.alerta_activada && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md shadow-sm">
                  <p className="font-bold">⚠️ Diagnóstico Severo — requiere atención prioritaria</p>
                </div>
              )}
            </div>

            {/* Respuestas: solo lectura, sin ningún control de edición */}
            <div className="bg-white rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-extrabold text-black">Respuestas de la evaluación</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Documento clínico inmutable — vista de solo lectura.
                </p>
              </div>

              <ul className="divide-y divide-gray-100">
                {evaluacion.respuestas_json.map((respuesta, indice) => (
                  <li key={respuesta.id_pregunta} className="p-6">
                    <p className="text-sm font-bold text-gray-500 mb-1">Pregunta {indice + 1}</p>
                    <p className="text-black font-medium mb-3">{respuesta.texto_pregunta}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm font-semibold text-gray-800">
                      {textoDeRespuesta(respuesta.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}