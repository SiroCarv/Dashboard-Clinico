import { useState } from 'react';
import { COLOR_MARCA, ESTILOS_CATEGORIA_CLIMA_AULA } from '../../../shared/theme/paletaColores';
import {
  obtenerEtiquetaIdentidad,
  obtenerNombreMostrado,
  obtenerEstiloEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

const ETIQUETA_INSTRUMENTO = {
  CLIMA_AULA: 'Cuestionario de Clima de Aula',
  GSHS: 'Encuesta Mundial de Salud a Escolares (GSHS)',
};

const ACENTO_INSTRUMENTO = {
  CLIMA_AULA: COLOR_MARCA.tealAzulado,
  GSHS: COLOR_MARCA.verdeMenta,
};

const PUNTAJE_MAXIMO_CLIMA_AULA = 20;

// Agrupa `respuestas_json` (formato [{ modulo, numero, valor }]) por
// módulo, para mostrarlo igual de organizado que el formulario original
// que respondió el paciente. Clima de Aula guarda `valor` como booleano
// real (lo pide el trigger que calcula el puntaje) — acá se muestra de
// nuevo como "Verdadero"/"Falso" para que se lea igual que en el
// formulario, en vez de "true"/"false".
function agruparPorModulo(respuestas) {
  const grupos = [];
  (respuestas ?? []).forEach((r) => {
    const valorMostrado = typeof r.valor === 'boolean' ? (r.valor ? 'Verdadero' : 'Falso') : r.valor;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.modulo === r.modulo) {
      ultimo.items.push({ ...r, valorMostrado });
    } else {
      grupos.push({ modulo: r.modulo, items: [{ ...r, valorMostrado }] });
    }
  });
  return grupos;
}

// Resumen propio de cada instrumento — nada de "puntaje/diagnóstico"
// genérico heredado del PHQ-9. Clima de Aula muestra su puntaje sobre 20
// y su categoría (5 niveles); GSHS no tiene un puntaje único por diseño
// clínico, así que solo muestra si activó una alerta puntual.
function ResumenInstrumento({ registro }) {
  if (registro.tipo_instrumento === 'CLIMA_AULA' && registro.resultado_json) {
    const { puntaje_total: puntaje, categoria } = registro.resultado_json;
    const estilo = ESTILOS_CATEGORIA_CLIMA_AULA[categoria] ?? 'bg-gray-100 border-gray-300 text-gray-800';
    return (
      <span className={`px-3 py-1 border rounded-full text-sm font-semibold ${estilo}`}>
        {puntaje}/{PUNTAJE_MAXIMO_CLIMA_AULA} — {categoria}
      </span>
    );
  }

  if (registro.tipo_instrumento === 'GSHS') {
    return registro.alerta_activada ? (
      <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide">
        ⚠️ Alerta activada
      </span>
    ) : (
      <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-semibold">
        Sin alertas puntuales
      </span>
    );
  }

  return null;
}

function TarjetaInstrumento({ registro }) {
  const [expandido, setExpandido] = useState(false);
  const etiqueta = ETIQUETA_INSTRUMENTO[registro.tipo_instrumento] ?? registro.tipo_instrumento;
  const acento = ACENTO_INSTRUMENTO[registro.tipo_instrumento] ?? COLOR_MARCA.violetaSuave;
  const grupos = agruparPorModulo(registro.respuestas_json);

  return (
    <div className={`bg-white rounded-lg shadow-sm border-t-4 ${acento.franja} overflow-hidden`}>
      <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="font-extrabold text-black">{etiqueta}</h4>
          <p className="text-gray-500 text-sm">
            {new Date(registro.fecha_registro).toLocaleString('es-BO')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ResumenInstrumento registro={registro} />
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            {expandido ? 'Ocultar respuestas' : 'Ver respuestas'}
          </button>
        </div>
      </div>

      {registro.tipo_instrumento === 'GSHS' && (
        <p className="px-5 pb-3 -mt-2 text-xs text-gray-400">
          La GSHS es un instrumento de prevalencia: no genera un puntaje único ni un diagnóstico
          automático. Cruzar estos datos con otros instrumentos es responsabilidad del
          profesional.
        </p>
      )}

      {expandido && (
        <div className="px-5 pb-5 max-h-96 overflow-y-auto border-t border-gray-100 pt-3">
          {grupos.map((grupo) => (
            <div key={grupo.modulo} className="mb-4 last:mb-0">
              <p className={`text-xs font-extrabold uppercase tracking-wide ${acento.tituloSeccion} mb-1`}>
                {grupo.modulo}
              </p>
              <div className="divide-y divide-gray-100">
                {grupo.items.map((item) => (
                  <div key={`${grupo.modulo}-${item.numero}`} className="py-1.5 text-sm flex justify-between gap-4">
                    <span className="text-gray-500">Pregunta {item.numero}</span>
                    <span className="text-gray-800 font-semibold text-right">{item.valorMostrado}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InformeConsolidadoPaciente({ paciente, instrumentos }) {
  const etiquetaIdentidad = obtenerEtiquetaIdentidad(paciente);

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded-md text-sm">
        Este informe muestra cada prueba por separado, tal como fue respondida. Cruzar e
        interpretar los resultados entre instrumentos es responsabilidad del profesional a
        cargo — la plataforma no calcula un diagnóstico combinado.
      </div>

      {paciente && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block px-2 py-0.5 border rounded-full text-xs font-semibold ${obtenerEstiloEtiquetaIdentidad(
                etiquetaIdentidad
              )}`}
            >
              {etiquetaIdentidad}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-black">{obtenerNombreMostrado(paciente)}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {paciente.institucion?.nombre ?? 'Sin institución asignada'}
            {paciente.curso ? ` · ${paciente.curso}${paciente.paralelo ? ` "${paciente.paralelo}"` : ''}` : ''}
          </p>
        </div>
      )}

      {instrumentos.length === 0 ? (
        <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500 font-medium">
          Todavía no se completó ningún instrumento.
        </div>
      ) : (
        <div className="space-y-4">
          {instrumentos.map((registro) => (
            <TarjetaInstrumento key={registro.id_evaluacion} registro={registro} />
          ))}
        </div>
      )}
    </div>
  );
}
