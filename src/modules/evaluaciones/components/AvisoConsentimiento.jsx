export default function AvisoConsentimiento({ acepta, onCambiarAcepta, onContinuar }) {
  return (
    <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-black">Consentimiento Informado</h2>
        <p className="text-gray-500 mt-2 font-medium">Antes de comenzar, lee lo siguiente</p>
      </div>

      <div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto pr-1 mb-6">
        <p>
          Esta evaluación forma parte de tu seguimiento psicológico. Tus respuestas serán
          revisadas exclusivamente por el profesional a cargo de tu caso y se almacenan de
          forma segura y confidencial.
        </p>
        <p>
          Responde con sinceridad; no existen respuestas correctas o incorrectas. Una vez
          enviada, la evaluación queda registrada de forma permanente en tu historial clínico
          y no podrá ser editada ni eliminada.
        </p>
        <p>
          Tu participación es voluntaria y los resultados se usarán únicamente con fines de
          diagnóstico y seguimiento clínico.
        </p>
      </div>

      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={acepta}
          onChange={(e) => onCambiarAcepta(e.target.checked)}
          className="mt-1 h-4 w-4 accent-orange-500 rounded border-gray-300 focus:ring-orange-500"
        />
        <span className="text-sm text-gray-800 font-medium">
          He leído y acepto participar de forma voluntaria en esta evaluación psicológica.
        </span>
      </label>

      <button
        type="button"
        onClick={onContinuar}
        disabled={!acepta}
        className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
          !acepta ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        Comenzar Evaluación
      </button>
    </div>
  );
}