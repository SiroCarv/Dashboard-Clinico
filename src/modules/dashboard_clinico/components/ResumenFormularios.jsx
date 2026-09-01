// Los indicadores del panel del psicólogo (historias "Conteo de
// formularios completados" + "Filtros de conteo por perfil"): antes
// mostraba todos los instrumentos apilados uno debajo del otro; ahora se
// eligen por pestañas (una por instrumento), para poder sumar Estrés,
// Ansiedad y Depresión sin que la pantalla crezca sin límite.
//
// Orden de pestañas: igual al orden en que el paciente responde los
// instrumentos en Encuesta.jsx (Clima de Aula, GSHS, Estrés, Ansiedad,
// Depresión) — mismo criterio en ambas pantallas, para que "el orden de
// los formularios" se lea igual seas psicólogo o estudiante. Bullying va
// al final, fuera de ese orden: es una pestaña placeholder agregada a
// pedido del cliente (meramente visual, sin instrumento real detrás) y
// NO existe todavía en Encuesta.jsx, así que no le corresponde un lugar
// dentro del orden real de la encuesta del estudiante.
//
// Bullying (placeholder visual): no tiene datos, servicio ni trigger de
// Supabase detrás — a diferencia de los otros 5, esta pestaña no recibe
// props de gráfico ni depende de `hayPersonasFiltradas`/GSHS. Solo
// muestra un aviso de "aún no disponible", siempre igual sin importar
// los filtros de perfil activos (mismo motivo por el que GSHS tampoco
// respeta esos filtros, aunque la razón acá es que no hay ningún dato
// que filtrar). Cuando el instrumento se implemente de verdad, esta
// pestaña deja de ser un caso especial y pasa a construirse igual que
// Clima de Aula/Estrés/Ansiedad/Depresión (props de gráfico + trigger de
// Supabase).
//
// Por instrumento:
//   - Clima de Aula, Estrés, Ansiedad y Depresión sí calculan una
//     categoría (trigger calcular_resultado_instrumento en Supabase), así
//     que su pestaña muestra el gráfico de barras + dona de
//     SeccionGraficoInstrumento, extraído para reutilizarse también en
//     la pestaña GSHS de IndicadoresGSHS.jsx (psicólogo) y en la pestaña
//     Gráficas de PanelConsolidadoSuperadmin.jsx (superadmin). Estos 4
//     dependen de `hayPersonasFiltradas` (los filtros de perfil de
//     FiltrosResumen.jsx sí les aplican).
//   - GSHS es distinto: es un instrumento de prevalencia sin categoría ni
//     puntaje agregable acá (ver nota en gshsData.js). Antes esta pestaña
//     mostraba solo un botón hacia la pantalla dedicada
//     (IndicadoresGSHS.jsx); ahora muestra el contenido completo de esa
//     pantalla directamente acá adentro (mismo resumenAlerta +
//     GraficoModulosGSHS, vía useIndicadoresGSHS llamado en Dashboard.jsx
//     y pasado como props) — el psicólogo ya no necesita navegar a otra
//     pantalla para verlo. Por eso GSHS NO respeta
//     `hayPersonasFiltradas`: esos filtros de perfil (sexo/edad/curso/
//     paralelo/turno) nunca se aplicaron a los datos de GSHS —
//     useIndicadoresGSHS trae su propio alcance (institución completa del
//     psicólogo, vía RLS), independiente de `pacientesFiltrados`. Ocultar
//     GSHS cuando esos filtros no matchean a nadie sería un falso
//     negativo: los datos de GSHS seguirían existiendo igual.
//
// Acento por pestaña: cada instrumento usa el mismo color que ya lo
// identifica en el resto de la app (Encuesta, Informe Consolidado, Panel
// Consolidado del superadmin — ver COLOR_MARCA en paletaColores.js), para
// que "este color = este instrumento" se lea igual en toda la
// plataforma, no solo acá.
import { useState } from 'react';
import { SeccionGraficoInstrumento } from './SeccionGraficoInstrumento';
import { GraficoModulosGSHS } from './GraficoModulosGSHS';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';

const TAB_CLIMA_AULA = 'CLIMA_AULA';
const TAB_GSHS = 'GSHS';
const TAB_ESTRES = 'ESTRES';
const TAB_ANSIEDAD = 'ANSIEDAD';
const TAB_DEPRESION = 'DEPRESION';
const TAB_BULLYING = 'BULLYING';

const PESTANAS = [
  { id: TAB_CLIMA_AULA, etiqueta: 'Clima de Aula', color: COLOR_MARCA.tealAzulado },
  { id: TAB_GSHS, etiqueta: 'GSHS', color: COLOR_MARCA.verdeMenta },
  { id: TAB_ESTRES, etiqueta: 'Estrés', color: COLOR_MARCA.celeste },
  { id: TAB_ANSIEDAD, etiqueta: 'Ansiedad', color: COLOR_MARCA.indigo },
  { id: TAB_DEPRESION, etiqueta: 'Depresión', color: COLOR_MARCA.fucsia },
  { id: TAB_BULLYING, etiqueta: 'Bullying', color: COLOR_MARCA.grisNeutro },
];

export function ResumenFormularios({
  graficoClimaAula,
  graficoEstres,
  graficoAnsiedad,
  graficoDepresion,
  hayFiltrosActivos,
  hayPersonasFiltradas,
  modulosGshs,
  resumenAlertaGshs,
  totalEvaluacionesGshs,
  loadingGshs,
  errorGshs,
}) {
  const [pestanaActiva, setPestanaActiva] = useState(TAB_CLIMA_AULA);

  // Solo bloquea a los 4 instrumentos que sí dependen del perfil filtrado
  // (ver nota de archivo sobre por qué GSHS queda afuera de esta regla).
  // Bullying tampoco respeta esta regla — no depende de ningún dato real
  // (ver nota de archivo).
  const sinPersonasFiltradas = hayFiltrosActivos && !hayPersonasFiltradas;

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4 border-b border-gray-200 flex-wrap">
        {PESTANAS.map((pestana) => (
          <button
            key={pestana.id}
            type="button"
            onClick={() => setPestanaActiva(pestana.id)}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              pestanaActiva === pestana.id
                ? pestana.color.tabActivo
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            {pestana.etiqueta}
          </button>
        ))}
      </div>

      {pestanaActiva !== TAB_GSHS && pestanaActiva !== TAB_BULLYING && sinPersonasFiltradas && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No hay estudiantes con estas características.</p>
        </div>
      )}

      {pestanaActiva === TAB_BULLYING && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">
            El formulario de Bullying todavía no está disponible. Esta pestaña es un adelanto visual.
          </p>
        </div>
      )}

      {pestanaActiva === TAB_CLIMA_AULA && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Clima de Aula — por categoría" datos={graficoClimaAula} />
      )}

      {pestanaActiva === TAB_ESTRES && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Estrés — por nivel" datos={graficoEstres} />
      )}

      {pestanaActiva === TAB_ANSIEDAD && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Ansiedad — por nivel" datos={graficoAnsiedad} />
      )}

      {pestanaActiva === TAB_DEPRESION && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Depresión — por nivel" datos={graficoDepresion} />
      )}

      {pestanaActiva === TAB_GSHS && (
        <>
          {errorGshs && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
              {errorGshs}
            </div>
          )}

          {loadingGshs ? (
            <div className="flex flex-col justify-center items-center py-12 gap-3">
              <svg
                className="animate-spin h-8 w-8 text-emerald-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-700 font-semibold">Cargando resultados del GSHS...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <SeccionGraficoInstrumento
                titulo={`GSHS — ${totalEvaluacionesGshs} ${
                  totalEvaluacionesGshs === 1 ? 'evaluación considerada' : 'evaluaciones consideradas'
                }`}
                datos={resumenAlertaGshs}
              />
              <GraficoModulosGSHS modulos={modulosGshs} totalEvaluaciones={totalEvaluacionesGshs} />
            </div>
          )}
        </>
      )}
    </div>
  );
}