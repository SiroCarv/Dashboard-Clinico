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

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
      <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide">
        ⚠️ Alerta activada
      </span>
    ) : (
      <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-semibold">
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

  // Historia "Visibilidad de resultados de Riesgo Suicida para Psicólogo
  // y Superadmin": antes solo GSHS mostraba una insignia de alerta
  // aparte; Riesgo Suicida ("Riesgo Alto") y Depresión (cuando la
  // respuesta de ideación suicida del PHQ-9 la activa, ver trigger en
  // Supabase) también encienden `alerta_activada`, así que se muestra la
  // misma insignia roja que ya usa GSHS.
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`px-3 py-1 border rounded-full text-sm font-semibold ${estilo}`}>
        {puntaje != null ? `${puntaje} — ${categoria}` : categoria}
      </span>
      {resultado.alerta_activada && (
        <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide">
          ⚠️ Alerta
        </span>
      )}
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
  const personas = useMemo(() => agruparResultadosPorPersona(resultados), [resultados]);

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
                        <li key={registro.id_evaluacion} className="py-2">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span
                              className={`px-2.5 py-1 border rounded-full text-xs font-semibold ${acento.suave}`}
                            >
                              {ETIQUETA_INSTRUMENTO[registro.tipo_instrumento] ?? registro.tipo_instrumento}
                            </span>
                            <ResumenResultado resultado={registro} />
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatearFecha(registro.fecha_registro)}
                            </span>
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