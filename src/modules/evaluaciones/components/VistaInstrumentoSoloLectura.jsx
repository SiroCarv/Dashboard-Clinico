// Componente genérico de SOLO LECTURA para previsualizar instrumentos
// clínicos (historia "Vista Previa de Nuevos Instrumentos Clínicos").
//
// No usa <input> reales a propósito: son marcadores puramente visuales
// (no seleccionables, no enfocables), para que quede inequívoco que esta
// vista no captura respuestas ni las guarda en ningún lado. No hay estado,
// no hay onChange, no hay botón de enviar.

function OpcionVerdaderoFalso() {
  return (
    <div className="flex items-center gap-6 mt-2">
      <span className="flex items-center gap-2 text-gray-700 select-none">
        <span className="w-5 h-5 border border-gray-300 rounded-sm inline-block bg-gray-50" />
        Verdadero
      </span>
      <span className="flex items-center gap-2 text-gray-700 select-none">
        <span className="w-5 h-5 border border-gray-300 rounded-sm inline-block bg-gray-50" />
        Falso
      </span>
    </div>
  );
}

function ListaOpciones({ opciones }) {
  const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  if (!opciones || opciones.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {opciones.map((opcion, indice) => (
        <div key={opcion} className="flex items-start gap-2 select-none">
          <span className="mt-0.5 flex-none inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 bg-gray-50 text-xs font-bold text-gray-500">
            {LETRAS[indice]}
          </span>
          <span className="text-gray-700">{opcion}</span>
        </div>
      ))}
    </div>
  );
}

function Item({ item, tipoRespuesta }) {
  return (
    <div className="py-4">
      {item.notaPrevia && (
        <p className="text-gray-500 italic text-sm mb-2">{item.notaPrevia}</p>
      )}
      <p className="text-black font-bold">
        {item.numero}. {item.texto}
      </p>
      {item.nota && <p className="text-gray-500 italic text-sm mt-1">{item.nota}</p>}

      {tipoRespuesta === 'verdadero_falso' ? (
        <OpcionVerdaderoFalso />
      ) : (
        <ListaOpciones opciones={item.opciones} />
      )}
    </div>
  );
}

export default function VistaInstrumentoSoloLectura({ instrumento }) {
  const { titulo, subtitulo, tipoRespuesta, secciones } = instrumento;

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600">
            Vista previa — solo lectura
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-black">{titulo}</h3>
        {subtitulo && <p className="text-gray-500 text-sm mt-1">{subtitulo}</p>}
      </div>

      <div className="px-6 pb-6">
        {secciones.map((seccion) => (
          <div key={seccion.titulo} className="mt-6 first:mt-4">
            <h4 className="text-base font-extrabold text-orange-600 uppercase tracking-wide mb-1">
              {seccion.titulo}
            </h4>
            {seccion.intro && <p className="text-gray-500 italic text-sm mb-2">{seccion.intro}</p>}

            <div className="divide-y divide-gray-100">
              {seccion.items.map((item) => (
                <Item key={`${seccion.titulo}-${item.numero}`} item={item} tipoRespuesta={tipoRespuesta} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}