// src/modules/evaluaciones/components/PreguntaEncuesta.jsx
import { ESCALA_RESPUESTA } from '../data/preguntasEncuesta';

export default function PreguntaEncuesta({ pregunta, indice, valorSeleccionado, onSeleccionar }) {
  return (
    <div>
      <label className="block text-sm font-bold text-black mb-2">
        {indice}. {pregunta.texto}
      </label>

      <div className="grid grid-cols-1 gap-2">
        {ESCALA_RESPUESTA.map((opcion) => (
          <label
            key={opcion.valor}
            className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md cursor-pointer transition-all has-checked:border-orange-500 has-checked:bg-orange-50"
          >
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              value={opcion.valor}
              checked={valorSeleccionado === opcion.valor}
              onChange={() => onSeleccionar(pregunta.id, opcion.valor)}
              required
              className="accent-orange-500"
            />
            <span className="text-sm text-gray-800">{opcion.texto}</span>
          </label>
        ))}
      </div>
    </div>
  );
}