// Contenido del Informe Consolidado (SCRUM-31): datos del paciente arriba
// (correo, teléfono, género, etc. — solo se muestran los campos que
// tienen valor) y, debajo, una tarjeta expandible por cada instrumento
// que completó, cada una con su propio resumen de resultado.
//
// Solo se renderiza cuando `paciente` es truthy — InformeConsolidado.jsx
// (la página) ya filtra el caso "no encontrado / sin acceso" antes de
// montar este componente, así que acá se asume que `paciente` siempre
// existe.
import { useState } from 'react';
import { COLOR_MARCA, ESTILOS_CATEGORIA_CLIMA_AULA } from '../../../shared/theme/paletaColores';
import {
  obtenerEtiquetaIdentidad,
  obtenerNombreMostrado,
  obtenerEstiloEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';
import { INSTRUMENTO_CLIMA_AULA, INSTRUMENTO_GSHS } from '../../evaluaciones';
import LeyendaClimaAula from './LeyendaClimaAula';

const ETIQUETA_INSTRUMENTO = {
  CLIMA_AULA: 'Cuestionario de Clima de Aula',
  GSHS: 'Encuesta Mundial de Salud a Escolares (GSHS)',
};

const ACENTO_INSTRUMENTO = {
  CLIMA_AULA: COLOR_MARCA.tealAzulado,
  GSHS: COLOR_MARCA.verdeMenta,
};

const PUNTAJE_MAXIMO_CLIMA_AULA = 20;

// `respuestas_json` solo guarda { modulo, numero, valor } por cada
// respuesta — nunca el enunciado de la pregunta (ver el comentario sobre
// el trigger de alerta en evaluaciones/data/gshsData.js: el cálculo
// compara por texto exacto de módulo/número/valor, no busca el
// enunciado). Para mostrar la pregunta real en el informe hay que
// volver a buscarla en la definición del instrumento correspondiente,
// cruzando por módulo + número.
const INSTRUMENTOS_POR_TIPO = {
  CLIMA_AULA: INSTRUMENTO_CLIMA_AULA,
  GSHS: INSTRUMENTO_GSHS,
};

// Si no encuentra la pregunta (ej. el instrumento cambió de contenido
// después de que este paciente respondió), cae de vuelta a "Pregunta N"
// en lugar de romper el informe — nunca deja el valor de la respuesta
// sin una etiqueta al lado.
function obtenerTextoPregunta(tipoInstrumento, modulo, numero) {
  const instrumento = INSTRUMENTOS_POR_TIPO[tipoInstrumento];
  const seccion = instrumento?.secciones.find((s) => s.titulo === modulo);
  const item = seccion?.items.find((i) => i.numero === numero);
  return item?.texto ?? `Pregunta ${numero}`;
}

// Agrupa las respuestas planas (una fila por pregunta) en bloques
// consecutivos por módulo, para mostrar el encabezado de tema solo
// cuando cambia — mismo patrón visual que usa FormularioInstrumento.jsx
// al responder.
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

function formatearFechaNacimiento(fecha) {
  if (!fecha) return null;
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// wrap-break-word es lo que evita que un valor largo y sin espacios (un
// correo, un código) se desborde encima de la columna de al lado — el
// bug de "Correo se choca con Género" en mobile era por esto: faltaba
// acá.
function Dato({ etiqueta, valor }) {
  if (!valor) return null;
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{etiqueta}</p>
      <p className="text-gray-800 font-semibold wrap-break-word">{valor}</p>
    </div>
  );
}

// Resumen visible sin expandir la tarjeta: puntaje+categoría para Clima
// de Aula, o el estado de la alerta puntual para GSHS (que no tiene
// puntaje ni diagnóstico, ver nota en gshsData.js).
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
          <p className="text-gray-700 text-sm font-medium">
            {new Date(registro.fecha_registro).toLocaleString('es-BO')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ResumenInstrumento registro={registro} />
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className="text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
          >
            {expandido ? 'Ocultar respuestas' : 'Ver respuestas'}
          </button>
        </div>
      </div>

      {registro.tipo_instrumento === 'CLIMA_AULA' && registro.resultado_json && (
        <LeyendaClimaAula categoria={registro.resultado_json.categoria} />
      )}

      {registro.tipo_instrumento === 'GSHS' && (
        <p className="px-5 pb-3 -mt-2 text-xs text-gray-600">
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
                  // Pregunta y respuesta SIEMPRE apiladas (nunca lado a
                  // lado): tanto el enunciado real como algunas opciones
                  // de respuesta (sobre todo en GSHS) pueden ser textos
                  // largos, y ponerlos en la misma fila es exactamente lo
                  // que causó el bug de "Correo se choca con Género" en
                  // el bloque de datos de arriba. Apilar evita que se
                  // repita ese problema sin importar el largo del texto
                  // ni el ancho de pantalla.
                  <div key={`${grupo.modulo}-${item.numero}`} className="py-2 text-sm">
                    <p className="text-gray-700 wrap-break-word">
                      {obtenerTextoPregunta(registro.tipo_instrumento, grupo.modulo, item.numero)}
                    </p>
                    <p className="text-gray-900 font-semibold wrap-break-word mt-0.5">
                      → {item.valorMostrado}
                    </p>
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

export default function InformeConsolidadoPaciente({ paciente, instrumentos, exportando, onExportar }) {
  // Guarda defensiva: este componente asume que `paciente` viene resuelto
  // (InformeConsolidado.jsx, la página, ya filtra loading/"no encontrado"
  // antes de montarlo) — pero si por lo que sea llega sin esa prop, esto
  // evita el TypeError de "Cannot read properties of undefined" en vez de
  // dejar la pantalla en blanco.
  if (!paciente) return null;

  const etiquetaIdentidad = obtenerEtiquetaIdentidad(paciente);
  const esParticipante = Boolean(paciente.institucion);

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded-md text-sm">
        Este informe muestra cada prueba por separado, tal como fue respondida. Cruzar e
        interpretar los resultados entre instrumentos es responsabilidad del profesional a
        cargo — la plataforma no calcula un diagnóstico combinado.
      </div>

      {paciente && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
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
              <p className="text-gray-700 text-sm mt-1 font-medium">
                {esParticipante
                  ? paciente.institucion.nombre
                  : 'Consultante particular (sin institución)'}
                {paciente.curso ? ` · ${paciente.curso}${paciente.paralelo ? ` "${paciente.paralelo}"` : ''}` : ''}
              </p>
            </div>

            {onExportar && (
              <button
                type="button"
                onClick={onExportar}
                disabled={exportando}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${COLOR_MARCA.tealAzulado.botonPrimario}`}
              >
                {exportando ? (
                  <>
                    <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Exportar a Excel
                  </>
                )}
              </button>
            )}
          </div>

          {/* Toda la información capturada al registrarse — cambia según
              haya sido un registro institucional (participante, con
              curso/paralelo/turno/código) o particular (consultante, con
              teléfono). Cada campo se omite solo si está vacío.
              grid-cols-1 en mobile (antes era grid-cols-2, que fue la
              causa real del bug de "Correo se choca con Género": dos
              columnas angostas no le dejaban espacio a un correo largo). */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Dato etiqueta="Correo" valor={paciente.email} />
            <Dato etiqueta="Teléfono" valor={paciente.telefono} />
            <Dato etiqueta="Género" valor={paciente.genero} />
            <Dato etiqueta="Fecha de nacimiento" valor={formatearFechaNacimiento(paciente.fecha_nacimiento)} />
            <Dato etiqueta="Turno" valor={paciente.turno} />
            <Dato etiqueta="Código de estudiante" valor={paciente.codigo_estudiante} />
          </div>
        </div>
      )}

      {instrumentos.length === 0 ? (
        <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-700 font-medium">
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