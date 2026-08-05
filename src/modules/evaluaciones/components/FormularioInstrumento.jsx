import { useEffect, useRef } from 'react';
import { useFormularioInstrumento } from '../hooks/useFormularioInstrumento';

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

// Único uso hoy: estatura y peso (Módulo sobre Conductas Alimentarias,
// GSHS). Filtra cualquier tecla que no sea un dígito — no admite letras
// ni símbolos, tal como se pidió para la pregunta de peso (se aplicó
// también a estatura, mismo tipo de dato, para no dejarla inconsistente).
function CampoTexto({ valor, onCambiar }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={valor ?? ''}
      onChange={(e) => onCambiar(e.target.value.replace(/[^0-9]/g, ''))}
      className="mt-2 w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
    />
  );
}

function Pregunta({ item, valor, onCambiar, tipoRespuesta, acento, marcarSiFalta }) {
  const respondida = valor !== undefined;
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

export default function FormularioInstrumento({ idPaciente, tipoInstrumento, instrumento, acento }) {
  const {
    cargando,
    yaEnviado,
    fechaEnvioPrevio,
    preguntasDePagina,
    pagina,
    totalPaginas,
    respuestas,
    responder,
    paginaCompleta,
    esUltimaPagina,
    mostrarFaltantes,
    mensajeValidacion,
    intentarSiguiente,
    irAnterior,
    intentarEnviar,
    enviando,
    error,
  } = useFormularioInstrumento({ idPaciente, tipoInstrumento, instrumento });

  const inicioRef = useRef(null);

  // Al cambiar de página (Siguiente o Anterior), vuelve al principio del
  // formulario. Sin esto, si quedaba scrolleado hacia abajo en la página
  // anterior, la nueva página podía renderizar más corta y dejar el botón
  // "Siguiente"/"Enviar" fuera de la vista, dando la sensación de que el
  // formulario "no dejaba avanzar".
  useEffect(() => {
    inicioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pagina]);

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-16">
        <svg className={`animate-spin h-8 w-8 ${acento.tituloSeccion}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (yaEnviado) {
    return (
      <div className={`bg-white rounded-lg shadow-xl border-t-8 ${acento.franja} p-8 text-center`}>
        <div className="mb-4 p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-sm font-bold">
          Ya enviaste este formulario
        </div>
        {fechaEnvioPrevio && (
          <p className="text-gray-500 text-sm">
            Registrado el {new Date(fechaEnvioPrevio).toLocaleDateString('es-BO')}.
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">Tu psicólogo(a) revisará tus respuestas.</p>
      </div>
    );
  }

  // Agrupa las preguntas de la página actual por sección, para mostrar el
  // encabezado de tema solo cuando cambia (igual que en la vista previa).
  const bloques = [];
  preguntasDePagina.forEach((item) => {
    const ultimo = bloques[bloques.length - 1];
    if (ultimo && ultimo.seccionTitulo === item.seccionTitulo) {
      ultimo.items.push(item);
    } else {
      bloques.push({ seccionTitulo: item.seccionTitulo, seccionIntro: item.seccionIntro, items: [item] });
    }
  });

  const respondidasEnPagina = preguntasDePagina.filter((p) => respuestas[p.clave] !== undefined).length;

  return (
    <div ref={inicioRef} className={`bg-white rounded-lg shadow-xl border-t-8 ${acento.franja} overflow-hidden scroll-mt-20`}>
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-extrabold text-black">{instrumento.titulo}</h3>
          {instrumento.subtitulo && <p className="text-gray-500 text-sm mt-1">{instrumento.subtitulo}</p>}
        </div>
        <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600 flex-none">
          Página {pagina + 1} de {totalPaginas}
        </span>
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

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {mostrarFaltantes && !paginaCompleta && (
          <p className="mt-4 text-sm text-orange-800 font-semibold">
            {mensajeValidacion} Respondiste {respondidasEnPagina} de {preguntasDePagina.length} preguntas de esta
            página.
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={irAnterior}
            disabled={pagina === 0}
            className="px-4 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {esUltimaPagina ? (
            <button
              type="button"
              onClick={intentarEnviar}
              disabled={enviando}
              className={`px-6 py-2.5 rounded-md font-bold text-white uppercase tracking-wide shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${acento.botonPrimario}`}
            >
              {enviando ? 'Enviando...' : 'Enviar respuestas'}
            </button>
          ) : (
            <button
              type="button"
              onClick={intentarSiguiente}
              className={`px-6 py-2.5 rounded-md font-bold text-white uppercase tracking-wide shadow-md transition-colors ${acento.botonPrimario}`}
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
