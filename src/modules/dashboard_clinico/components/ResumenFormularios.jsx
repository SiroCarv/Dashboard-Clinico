// Los indicadores del panel del psicólogo (historias "Conteo de
// formularios completados" + "Filtros de conteo por perfil"): antes
// mostraba todos los instrumentos apilados uno debajo del otro; ahora se
// eligen por pestañas (una por instrumento), para poder sumar Estrés,
// Ansiedad y Depresión sin que la pantalla crezca sin límite.
//
// Orden de pestañas: igual al orden en que el paciente responde los
// instrumentos en Encuesta.jsx (Clima de Aula, GSHS, Estrés, Ansiedad,
// Depresión, Cuidado Primario De Salud Familiar) — mismo criterio en
// ambas pantallas, para que "el orden de los formularios" se lea igual
// seas psicólogo o estudiante. Bullying va al final, fuera de ese orden:
// es una pestaña placeholder agregada a pedido del cliente (meramente
// visual, sin instrumento real detrás) y NO existe todavía en
// Encuesta.jsx, así que no le corresponde un lugar dentro del orden real
// de la encuesta del estudiante. Riesgo Suicida (sprint "Persona
// Particular") va después de Cuidado Primario y antes de Bullying, en el
// mismo orden en que aparece en la Encuesta de Persona Particular.
//
// Bullying (placeholder visual): no tiene datos, servicio ni trigger de
// Supabase detrás — a diferencia de los otros 6, esta pestaña no recibe
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
//   - Clima de Aula, Estrés, Ansiedad, Depresión, Cuidado Primario De
//     Salud Familiar y Riesgo Suicida sí calculan una categoría (trigger
//     calcular_resultado_instrumento en Supabase), así
//     que su pestaña muestra el gráfico de barras + dona de
//     SeccionGraficoInstrumento, extraído para reutilizarse también en
//     la pestaña GSHS de IndicadoresGSHS.jsx (psicólogo) y en la pestaña
//     Gráficas de PanelConsolidadoSuperadmin.jsx (superadmin). Estos 5
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
//
// `soloPersonaParticular` (NUEVO, sprint "Persona Particular" — historia
// "Filtrado de formularios según el tipo de psicólogo/a"): cuando es
// `true` (psicólogo/a de un Centro de Salud), esta pestañera oculta
// Clima de Aula, GSHS y Bullying, dejando ÚNICAMENTE los 5 formularios
// propios de Persona Particular. Cuando es `false`/`undefined`
// (psicólogo/a de colegio, u otra institución, o superadmin), se ven
// TODOS los formularios sin restricción — comportamiento idéntico al que
// ya existía antes de esta historia. Quién decide ese booleano es
// Dashboard.jsx, a partir de pacientesService.obtenerTipoInstitucionPropia().
import { useState } from 'react';
import { SeccionGraficoInstrumento } from './SeccionGraficoInstrumento';
import { GraficoModulosGSHS } from './GraficoModulosGSHS';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';

const TAB_CLIMA_AULA = 'CLIMA_AULA';
const TAB_GSHS = 'GSHS';
const TAB_ESTRES = 'ESTRES';
const TAB_ANSIEDAD = 'ANSIEDAD';
const TAB_DEPRESION = 'DEPRESION';
const TAB_APGAR_FAMILIAR = 'APGAR_FAMILIAR';
const TAB_RIESGO_SUICIDA = 'RIESGO_SUICIDA';
const TAB_BULLYING = 'BULLYING';

// Los 5 formularios propios de Persona Particular — mismo set que
// TABS_PERSONA_PARTICULAR en evaluaciones/pages/Encuesta.jsx. Se declara
// acá aparte para que el filtro de abajo sea explícito por inclusión, no
// por exclusión (más fácil de leer y de mantener si el día de mañana se
// agrega un formulario nuevo a cualquiera de los dos grupos).
const IDS_PERSONA_PARTICULAR = [TAB_ESTRES, TAB_ANSIEDAD, TAB_DEPRESION, TAB_APGAR_FAMILIAR, TAB_RIESGO_SUICIDA];

const PESTANAS = [
  { id: TAB_CLIMA_AULA, etiqueta: 'Clima de Aula', color: COLOR_MARCA.tealAzulado },
  { id: TAB_GSHS, etiqueta: 'GSHS', color: COLOR_MARCA.verdeMenta },
  { id: TAB_ESTRES, etiqueta: 'Estrés', color: COLOR_MARCA.celeste },
  { id: TAB_ANSIEDAD, etiqueta: 'Ansiedad', color: COLOR_MARCA.indigo },
  { id: TAB_DEPRESION, etiqueta: 'Depresión', color: COLOR_MARCA.fucsia },
  { id: TAB_APGAR_FAMILIAR, etiqueta: 'Cuidado Primario De Salud Familiar', color: COLOR_MARCA.rosa },
  { id: TAB_RIESGO_SUICIDA, etiqueta: 'Riesgo Suicida', color: COLOR_MARCA.purpura },
  { id: TAB_BULLYING, etiqueta: 'Bullying', color: COLOR_MARCA.grisNeutro },
];

export function ResumenFormularios({
  graficoClimaAula,
  graficoEstres,
  graficoAnsiedad,
  graficoDepresion,
  graficoApgarFamiliar,
  graficoRiesgoSuicida,
  hayFiltrosActivos,
  hayPersonasFiltradas,
  modulosGshs,
  resumenAlertaGshs,
  totalEvaluacionesGshs,
  loadingGshs,
  errorGshs,
  soloPersonaParticular = false,
}) {
  const pestanas = soloPersonaParticular
    ? PESTANAS.filter((p) => IDS_PERSONA_PARTICULAR.includes(p.id))
    : PESTANAS;

  const [pestanaActiva, setPestanaActiva] = useState(pestanas[0].id);

  // Si `soloPersonaParticular` cambia (ej. termina de cargar el tipo de
  // institución del psicólogo, que arranca en `false` mientras se
  // resuelve) y la pestaña activa ya no existe en la lista filtrada, cae
  // a la primera disponible — evita quedar en una pestaña "fantasma" sin
  // botón visible para volver a ella.
  const pestanaActivaValida = pestanas.some((p) => p.id === pestanaActiva) ? pestanaActiva : pestanas[0].id;

  // Solo bloquea a los instrumentos que sí dependen del perfil filtrado
  // (ver nota de archivo sobre por qué GSHS queda afuera de esta regla).
  // Bullying tampoco respeta esta regla — no depende de ningún dato real
  // (ver nota de archivo).
  const sinPersonasFiltradas = hayFiltrosActivos && !hayPersonasFiltradas;

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4 border-b border-gray-200 flex-wrap">
        {pestanas.map((pestana) => (
          <button
            key={pestana.id}
            type="button"
            onClick={() => setPestanaActiva(pestana.id)}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
              pestanaActivaValida === pestana.id
                ? pestana.color.tabActivo
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            {pestana.etiqueta}
          </button>
        ))}
      </div>

      {pestanaActivaValida !== TAB_GSHS && pestanaActivaValida !== TAB_BULLYING && sinPersonasFiltradas && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No hay estudiantes con estas características.</p>
        </div>
      )}

      {pestanaActivaValida === TAB_BULLYING && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">
            El formulario de Bullying todavía no está disponible. Esta pestaña es un adelanto visual.
          </p>
        </div>
      )}

      {pestanaActivaValida === TAB_CLIMA_AULA && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Clima de Aula — por categoría" datos={graficoClimaAula} />
      )}

      {pestanaActivaValida === TAB_ESTRES && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Estrés — por nivel" datos={graficoEstres} />
      )}

      {pestanaActivaValida === TAB_ANSIEDAD && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Ansiedad — por nivel" datos={graficoAnsiedad} />
      )}

      {pestanaActivaValida === TAB_DEPRESION && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Depresión — por nivel" datos={graficoDepresion} />
      )}

      {pestanaActivaValida === TAB_APGAR_FAMILIAR && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento
          titulo="Cuidado Primario De Salud Familiar — por categoría"
          datos={graficoApgarFamiliar}
        />
      )}

      {pestanaActivaValida === TAB_RIESGO_SUICIDA && !sinPersonasFiltradas && (
        <SeccionGraficoInstrumento titulo="Riesgo Suicida — por nivel" datos={graficoRiesgoSuicida} />
      )}

      {pestanaActivaValida === TAB_GSHS && (
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