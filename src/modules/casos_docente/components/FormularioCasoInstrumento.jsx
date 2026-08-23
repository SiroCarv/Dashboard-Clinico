// Capa puramente visual: renderiza TODAS las preguntas de un instrumento
// en una sola pantalla con scroll (ver nota de simplificación en
// useCuestionarioCaso.js). Los 3 tipos de campo (Verdadero/Falso,
// opción múltiple, texto libre) están duplicados desde
// evaluaciones/components/FormularioInstrumento.jsx a propósito — ese
// archivo no es parte de la API pública del módulo evaluaciones.
const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function CampoVerdaderoFalso({ nombre, valor, onCambiar, acento }) {
  return (
    <div className="flex items-center gap-6 mt-2">
      {['Verdadero', 'Falso'].map((opcion) => (
        <label key={opcion} className="flex items-center gap-2 text-gray-700 cursor-pointer">
          <input
            type="radio"
            name={nombre}
            checked={valor === opcion}
            onChange={() => onCambiar(opcion)}
            className={`h-4 w-4 ${acento.accent} border-gray-300`}
          />
          {opcion}
        </label>
      ))}
    </div>
  );
}

function CampoOpciones({ nombre, opciones, valor, onCambiar, acento }) {
  return (
    <div className="mt-2 space-y-2">
      {opciones.map((opcion, indice) => (
        <label key={opcion} className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name={nombre}
            checked={valor === opcion}
            onChange={() => onCambiar(opcion)}
            className={`mt-0.5 h-4 w-4 ${acento.accent} border-gray-300 flex-none`}
          />
          <span className="text-gray-700">
            <span className="font-bold text-gray-500 mr-1">{LETRAS[indice]}.</span>
            {opcion}
          </span>
        </label>
      ))}
    </div>
  );
}

function CampoTexto({ valor, onCambiar }) {
  const limpiar = (texto) => {
    let limpio = texto.replace(/[^0-9.,]/g, '');
    const indiceSeparador = limpio.search(/[.,]/);
    if (indiceSeparador !== -1) {
      limpio = limpio.slice(0, indiceSeparador + 1) + limpio.slice(indiceSeparador + 1).replace(/[.,]/g, '');
    }
    return limpio;
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={valor ?? ''}
      onChange={(e) => onCambiar(limpiar(e.target.value))}
      className="mt-2 w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
    />
  );
}

function Pregunta({ item, valor, onCambiar, tipoRespuesta, acento, marcarSiFalta }) {
  const respondida = valor !== undefined && valor !== null && valor !== '';
  const marcar = marcarSiFalta && !respondida;

  return (
    <div className={`py-4 ${marcar ? 'bg-orange-50/40 -mx-6 px-6' : ''}`}>
      {item.notaPrevia && <p className="text-gray-500 italic text-sm mb-2">{item.notaPrevia}</p>}
      <div className="flex items-start justify-between gap-3">
        <p className="text-black font-bold">
          {item.numero}. {item.texto}
        </p>
        {marcar && (
          <span className="flex-none px-2 py-0.5 bg-orange-100 border border-orange-300 text-orange-800 rounded-full text-xs font-bold uppercase tracking-wide">
            Falta responder
          </span>
        )}
      </div>
      {item.nota && <p className="text-gray-500 italic text-sm mt-1">{item.nota}</p>}

      {tipoRespuesta === 'verdadero_falso' ? (
        <CampoVerdaderoFalso nombre={item.clave} valor={valor} onCambiar={onCambiar} acento={acento} />
      ) : item.opciones && item.opciones.length > 0 ? (
        <CampoOpciones nombre={item.clave} opciones={item.opciones} valor={valor} onCambiar={onCambiar} acento={acento} />
      ) : (
        <CampoTexto valor={valor} onCambiar={onCambiar} />
      )}
    </div>
  );
}

export default function FormularioCasoInstrumento({ instrumento, acento, cuestionario }) {
  const { preguntas, respuestas, responder, mostrarFaltantes } = cuestionario;

  const bloques = [];
  preguntas.forEach((item) => {
    const ultimo = bloques[bloques.length - 1];
    if (ultimo && ultimo.seccionTitulo === item.seccionTitulo) {
      ultimo.items.push(item);
    } else {
      bloques.push({ seccionTitulo: item.seccionTitulo, seccionIntro: item.seccionIntro, items: [item] });
    }
  });

  return (
    <div className={`bg-white rounded-lg shadow-xl border-t-8 ${acento.franja} overflow-hidden`}>
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-xl font-extrabold text-black">{instrumento.titulo}</h3>
        {instrumento.subtitulo && <p className="text-gray-500 text-sm mt-1">{instrumento.subtitulo}</p>}
      </div>

      <div className="px-6 pb-6">
        {bloques.map((bloque) => (
          <div key={bloque.seccionTitulo} className="mt-6 first:mt-4">
            <h4 className={`text-base font-extrabold ${acento.tituloSeccion} uppercase tracking-wide mb-1`}>
              {bloque.seccionTitulo}
            </h4>
            {bloque.seccionIntro && <p className="text-gray-500 italic text-sm mb-2">{bloque.seccionIntro}</p>}

            <div className="divide-y divide-gray-100">
              {bloque.items.map((item) => (
                <Pregunta
                  key={item.clave}
                  item={item}
                  valor={respuestas[item.clave]}
                  onCambiar={(valor) => responder(item.clave, valor)}
                  tipoRespuesta={instrumento.tipoRespuesta}
                  acento={acento}
                  marcarSiFalta={mostrarFaltantes}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}