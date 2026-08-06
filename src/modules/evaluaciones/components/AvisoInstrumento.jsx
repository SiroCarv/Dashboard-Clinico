// Mensaje flotante (overlay a pantalla completa) que aparece la primera
// vez que el paciente entra a la pestaña de un instrumento, ya con el
// consentimiento/asentimiento general aceptado. Bloquea el acceso a las
// preguntas hasta que presiona "Aceptar y comenzar" — Encuesta.jsx lleva
// la cuenta de qué instrumentos ya fueron aceptados en la sesión actual
// (`avisosAceptados`) para no repetir el aviso al volver a esa pestaña.
export default function AvisoInstrumento({ titulo, info, acento, onAceptar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`max-w-md w-full bg-white p-8 border-t-8 ${acento.franja} rounded-lg shadow-xl`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-black">{titulo}</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${acento.tituloSeccion} mb-1`}>
              Tiempo estimado
            </p>
            <p className="text-gray-700 text-sm">{info.tiempoEstimado}</p>
          </div>

          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${acento.tituloSeccion} mb-1`}>
              Objetivo
            </p>
            <p className="text-gray-700 text-sm">{info.objetivo}</p>
          </div>

          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${acento.tituloSeccion} mb-1`}>
              ¿De qué trata?
            </p>
            <p className="text-gray-700 text-sm">{info.deQueTrata}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAceptar}
          className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide ${acento.botonPrimario}`}
        >
          Aceptar y comenzar
        </button>
      </div>
    </div>
  );
}
