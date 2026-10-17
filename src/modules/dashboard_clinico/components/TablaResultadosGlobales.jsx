// Tabla del Panel Consolidado del superadministrador (SCRUM-56): una
// fila por PERSONA, con su institución, el psicólogo asignado y, juntos
// en la misma fila, todos los formularios que completó con su resultado.
//
// Una fila por persona (cambio posterior a SCRUM-56, a pedido del
// cliente): antes cada fila era un resultado suelto, así que quien
// completaba varios formularios aparecía repetida y repartida por la
// tabla. Ahora los resultados (ya filtrados) se agrupan con
// agruparResultadosPorPersona.js. El criterio original de SCRUM-56 —
// identificar institución y psicólogo "por cada resultado" — sigue
// cumpliéndose: toda la información sigue visible, solo que agrupada
// bajo la persona a la que pertenece.
//
// Sin scroll horizontal (corrección posterior a SCRUM-56): se mantiene
// en 4 columnas, sin quitar ningún dato. Cada resultado lleva su propia
// fecha, dentro de la última columna, junto a su formulario — ya no hay
// una columna "Fecha" aparte, porque una persona tiene varias.
//
// Resultados alineados (a pedido, porque se veía amontonado): cada
// resultado es una fila con 4 columnas fijas (formulario, resultado,
// alerta, fecha). Antes eran etiquetas que se acomodaban solas según el
// espacio, así que la fecha y la alerta caían en lugares distintos de un
// resultado a otro. Con columnas de ancho fijo quedan una debajo de la
// otra, aunque a un resultado le falte la alerta (esa columna queda
// vacía, no se corre). Dentro de cada persona, los resultados con alerta
// van primero (el orden por fecha se conserva dentro de cada grupo).
//
// "Registrado por" sigue siendo una línea chica, ahora debajo de cada
// resultado que lo tenga (no debajo del nombre): el origen es un dato
// de cada resultado, y una misma persona podría tener resultados de
// ambos orígenes.
//
// La etiqueta Participante/Consultante que tenía la columna de nombre
// se retiró junto con el resto de la corrección de terminología
// "Paciente → Estudiante" (ver shared/utils/identidadUsuario.js): en
// esta tabla ya no aporta nada, porque toda fila es de alguien con
// cuenta de rol Estudiante.
//
// No es clickeable ni lleva a un informe: no hay historia de "detalle
// de una persona" en el alcance de SCRUM-56.
//
// GSHS — DECISIÓN DEL CLIENTE (actualizada en SCRUM-57): en ESTA tabla
// nunca se lee ni se muestra `resultado_json` para este instrumento — son
// indicadores de prevalencia por módulo de un estudiante puntual, y la
// Licenciada solo autorizó mostrarlos agregados entre muchos estudiantes,
// nunca fila por fila. Acá se sigue usando solo `alerta_activada`, igual
// que en InformeConsolidadoPaciente.jsx. El porcentaje agregado por módulo
// vive en su propia sección (pestaña GSHS de dashboard_clinico/pages/
// IndicadoresGSHS.jsx para el psicólogo, y de la pestaña Gráficas de
// PanelConsolidadoSuperadmin.jsx para el superadmin), no en esta tabla.
//
// Las filas de personas con ALGÚN resultado con `alerta_activada = true`
// se resaltan con FILA_ALERTA_ACTIVADA (rojo, reservado exclusivamente
// para severidad clínica), mismo criterio que TablaPacientes.jsx; la
// insignia "⚠️ Alerta" de cada resultado indica cuál es el que la activó.
import { useMemo } from 'react';
import {
  COLOR_MARCA,
  ESTILOS_CATEGORIA_CLIMA_AULA,
  FILA_ALERTA_ACTIVADA,
} from '../../../shared/theme/paletaColores';
import { obtenerNombreMostrado } from '../../../shared/utils/identidadUsuario';
import { agruparResultadosPorPersona } from '../utils/agruparResultadosPorPersona';

const ETIQUETA_INSTRUMENTO = {
  CLIMA_AULA: 'Clima de Aula',
  GSHS: 'GSHS',
  ESTRES: 'Estrés',
  ANSIEDAD: 'Ansiedad',
  DEPRESION: 'Depresión',
  // Agregados junto con la historia "Visibilidad de resultados de Riesgo
  // Suicida para Psicólogo y Superadmin": esta tabla ya recibía filas de
  // estos 2 instrumentos (Apgar Familiar desde antes, Riesgo Suicida en
  // cuanto se habilite para Estudiante) sin ninguna etiqueta ni acento
  // propio — se mostraban con el tipo técnico crudo. Mismo texto que
  // InformePersonaParticular.jsx.
  APGAR_FAMILIAR: 'Cuidado Primario De Salud Familiar',
  RIESGO_SUICIDA: 'Riesgo Suicida',
  BULLYING: 'Bullying',
};

// Mismo criterio de color que InformeConsolidadoPaciente.jsx: cada
// instrumento se identifica con uno de los 5 acentos reservados para
// esto en paletaColores.js (nunca naranja/violeta, que son el acento de
// marca general de esta pantalla, y nunca rojo/amarillo, reservados a
// severidad clínica).
const ACENTO_INSTRUMENTO = {
  CLIMA_AULA: COLOR_MARCA.tealAzulado,
  GSHS: COLOR_MARCA.verdeMenta,
  ESTRES: COLOR_MARCA.celeste,
  ANSIEDAD: COLOR_MARCA.indigo,
  DEPRESION: COLOR_MARCA.fucsia,
  APGAR_FAMILIAR: COLOR_MARCA.rosa,
  RIESGO_SUICIDA: COLOR_MARCA.purpura,
  BULLYING: COLOR_MARCA.cian,
};

// La fecha y la hora van en dos líneas (ver FechaResultado): así la
// columna de fecha es angosta y deja más ancho al resultado.
function formatearDia(fecha) {
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

// Columnas fijas de cada resultado: formulario | resultado | alerta |
// fecha. Los anchos fijos son lo que mantiene todo alineado entre una fila
// y la siguiente. El resultado tiene un ancho máximo (no se estira con la
// pantalla) para que la alerta y la fecha queden pegadas a él en vez de
// irse al borde derecho; si la pantalla es angosta, se encoge (minmax).
const COLUMNAS_RESULTADO =
  'grid grid-cols-[9rem_minmax(0,18rem)_5.5rem_4.5rem] items-center gap-x-3';

// Pone primero los resultados con alerta. `sort` es estable: entre los que
// empatan se conserva el orden original (más reciente primero).
function ordenarAlertasPrimero(registros) {
  return [...registros].sort((a, b) => Number(Boolean(b.alerta_activada)) - Number(Boolean(a.alerta_activada)));
}

// Resumen visible del resultado: puntaje + categoría para los
// instrumentos que sí lo calculan (Bullying solo trae categoría, sin
// puntaje) (ver trigger
// calcular_resultado_instrumento en la base real), o solo el estado de
// la alerta para GSHS, que nunca expone su `resultado_json` (ver nota
// de archivo). Las categorías de Estrés/Ansiedad/Depresión todavía no
// tienen un esquema de color propio confirmado por el responsable
// clínico (a diferencia de Clima de Aula, que sí lo tiene en
// ESTILOS_CATEGORIA_CLIMA_AULA) — se muestran en un badge neutro a
// propósito, en vez de inventar un mapeo de severidad no validado. La
// señal de severidad real sigue siendo `alerta_activada` (resalta la
// fila entera), no el color de este badge.
function ResumenResultado({ resultado }) {
  if (resultado.tipo_instrumento === 'GSHS') {
    return resultado.alerta_activada ? (
      <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap">
        ⚠️ Alerta activada
      </span>
    ) : (
      <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-semibold whitespace-nowrap">
        Sin alertas puntuales
      </span>
    );
  }

  if (!resultado.resultado_json) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  const { puntaje_total: puntaje, categoria } = resultado.resultado_json;
  const estilo =
    resultado.tipo_instrumento === 'CLIMA_AULA'
      ? (ESTILOS_CATEGORIA_CLIMA_AULA[categoria] ?? 'bg-gray-100 border-gray-300 text-gray-800')
      : 'bg-gray-100 border-gray-300 text-gray-800';

  // La insignia de alerta de estos instrumentos ya no va dentro de este
  // resumen: tiene su propia columna fija (ver InsigniaAlerta), para que
  // quede alineada entre filas.
  return (
    <span
      className={`inline-block max-w-full px-3 py-1 border rounded-full text-sm font-semibold ${estilo}`}
    >
      {puntaje != null ? `${puntaje} — ${categoria}` : categoria}
    </span>
  );
}

// Historia "Visibilidad de resultados de Riesgo Suicida para Psicólogo y
// Superadmin": antes solo GSHS mostraba una insignia de alerta aparte;
// Riesgo Suicida ("Riesgo Alto") y Depresión (cuando la respuesta de
// ideación suicida del PHQ-9 la activa, ver trigger en Supabase) también
// encienden `alerta_activada`, así que se muestra la misma insignia roja
// que ya usa GSHS. GSHS no la repite acá: su resumen ya dice "Alerta
// activada" (ver ResumenResultado).
function InsigniaAlerta({ resultado }) {
  if (resultado.tipo_instrumento === 'GSHS' || !resultado.alerta_activada) {
    return null;
  }

  return (
    <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap">
      ⚠️ Alerta
    </span>
  );
}

function FechaResultado({ fecha }) {
  return (
    <div className="text-xs text-gray-500 leading-tight whitespace-nowrap">
      <p>{formatearDia(fecha)}</p>
      <p>{formatearHora(fecha)}</p>
    </div>
  );
}

// Línea chica bajo un resultado con el origen del registro (SCRUM-60),
// solo para el caso que sigue siendo excepción: registrado por un
// docente. El caso por defecto (autoenvío del propio estudiante, la
// inmensa mayoría) no muestra ninguna etiqueta — fila sin etiqueta =
// autoenvío, con etiqueta violeta = la excepción registrada por un
// docente.
function OrigenRegistro({ resultado }) {
  if (!resultado.registrado_por_docente_id) {
    return null;
  }

  return (
    <p className={`text-xs font-semibold mt-1 ${COLOR_MARCA.violetaSuave.tituloSeccion}`}>
      Registrado por: {resultado.docente?.nombre || 'nombre no disponible'}
    </p>
  );
}

export function TablaResultadosGlobales({ resultados, hayFiltrosActivos = false }) {
  const personas = useMemo(
    () =>
      agruparResultadosPorPersona(resultados).map((persona) => ({
        ...persona,
        registros: ordenarAlertasPrimero(persona.registros),
      })),
    [resultados]
  );

  if (personas.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">
          {hayFiltrosActivos
            ? 'No se encontraron resultados con estos criterios.'
            : 'Todavía no hay resultados de evaluaciones registrados.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <th className="p-4 font-bold border-b border-gray-200">Estudiante</th>
            <th className="p-4 font-bold border-b border-gray-200">Institución</th>
            <th className="p-4 font-bold border-b border-gray-200">Psicólogo asignado</th>
            <th className="p-4 font-bold border-b border-gray-200">Formularios y resultados</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {personas.map((persona) => {
            const { paciente, registros } = persona;

            return (
              <tr
                key={persona.clave}
                className={`transition-colors ${
                  persona.tieneAlertaActiva ? FILA_ALERTA_ACTIVADA : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-4 text-gray-800 font-medium align-top">
                  {obtenerNombreMostrado(paciente)}
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {registros.length === 1
                      ? '1 formulario completado'
                      : `${registros.length} formularios completados`}
                  </p>
                </td>
                <td className="p-4 text-gray-600 align-top">{paciente?.institucion?.nombre || '—'}</td>
                <td className="p-4 text-gray-600 align-top">{paciente?.psicologoResponsable?.nombre || '—'}</td>
                <td className="p-4 align-top">
                  <ul className="divide-y divide-gray-100 -my-2">
                    {registros.map((registro) => {
                      const acento = ACENTO_INSTRUMENTO[registro.tipo_instrumento] ?? COLOR_MARCA.violetaSuave;

                      return (
                        <li key={registro.id_evaluacion} className="py-3">
                          <div className={COLUMNAS_RESULTADO}>
                            <div>
                              <span
                                className={`inline-block px-2.5 py-1 border rounded-full text-xs font-semibold ${acento.suave}`}
                              >
                                {ETIQUETA_INSTRUMENTO[registro.tipo_instrumento] ?? registro.tipo_instrumento}
                              </span>
                            </div>
                            <div>
                              <ResumenResultado resultado={registro} />
                            </div>
                            <div>
                              <InsigniaAlerta resultado={registro} />
                            </div>
                            <FechaResultado fecha={registro.fecha_registro} />
                          </div>
                          <OrigenRegistro resultado={registro} />
                        </li>
                      );
                    })}
                  </ul>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}