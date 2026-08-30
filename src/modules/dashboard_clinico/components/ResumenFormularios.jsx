// Los indicadores del panel del psicólogo (historias "Conteo de
// formularios completados" + "Filtros de conteo por perfil"): por cada
// instrumento, un gráfico de barras verticales y uno de dona (ver
// SeccionGraficoInstrumento.jsx, extraído de acá para reutilizarlo en
// las pantallas de Resultados GSHS).
import { SeccionGraficoInstrumento } from './SeccionGraficoInstrumento';

export function ResumenFormularios({ graficoClimaAula, graficoGshs, hayFiltrosActivos, hayPersonasFiltradas }) {
  if (hayFiltrosActivos && !hayPersonasFiltradas) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-6">
        <p className="text-gray-500 font-medium">No hay estudiantes con estas características.</p>
      </div>
    );
  }

  const totalGshs = graficoGshs.reduce((suma, item) => suma + item.valor, 0);

  return (
    <div className="space-y-4 mb-6">
      <SeccionGraficoInstrumento titulo="Clima de Aula — por categoría" datos={graficoClimaAula} />
      <SeccionGraficoInstrumento
        titulo={`GSHS — ${totalGshs} ${totalGshs === 1 ? 'persona completó' : 'personas completaron'}`}
        datos={graficoGshs}
      />
    </div>
  );
}
// Los indicadores del panel del psicólogo (historias "Conteo de
// formularios completados" + "Filtros de conteo por perfil"): antes
// mostraba todos los instrumentos apilados uno debajo del otro; ahora se
// eligen por pestañas (una por instrumento), para poder sumar Estrés,
// Ansiedad y Depresión sin que la pantalla crezca sin límite.
//
// Por instrumento:
//   - Clima de Aula, Estrés, Ansiedad y Depresión sí calculan una
//     categoría (trigger calcular_resultado_instrumento en Supabase), así
//     que su pestaña muestra el gráfico de barras + dona de
//     SeccionGraficoInstrumento, extraído para reutilizarse también en
//     las pantallas de Resultados GSHS (IndicadoresGSHS.jsx /
//     IndicadoresGSHSSuperadmin.jsx).
//   - GSHS es distinto: es un instrumento de prevalencia sin categoría ni
//     puntaje agregable acá (ver nota en gshsData.js), y su desglose real
//     ("% de riesgo por módulo") ya vive en su propia pantalla dedicada
//     (dashboard_clinico/pages/IndicadoresGSHS.jsx). Antes esta pestaña
//     también dibujaba un gráfico propio (resumen con/sin alerta), pero
//     duplicaba exactamente lo que ya muestra esa pantalla dedicada — se
//     retiró y en su lugar la pestaña de GSHS es un acceso directo a esa
//     pantalla.
//
// Acento por pestaña: cada instrumento usa el mismo color que ya lo
// identifica en el resto de la app (Encuesta, Informe Consolidado, Panel
// Consolidado del superadmin — ver COLOR_MARCA en paletaColores.js), para
// que "este color = este instrumento" se lea igual en toda la
// plataforma, no solo acá.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeccionGraficoInstrumento } from './SeccionGraficoInstrumento';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';

const TAB_CLIMA_AULA = 'CLIMA_AULA';
const TAB_ESTRES = 'ESTRES';
const TAB_ANSIEDAD = 'ANSIEDAD';
const TAB_DEPRESION = 'DEPRESION';
const TAB_GSHS = 'GSHS';

const PESTANAS = [
  { id: TAB_CLIMA_AULA, etiqueta: 'Clima de Aula', color: COLOR_MARCA.tealAzulado },
  { id: TAB_ESTRES, etiqueta: 'Estrés', color: COLOR_MARCA.celeste },
  { id: TAB_ANSIEDAD, etiqueta: 'Ansiedad', color: COLOR_MARCA.indigo },
  { id: TAB_DEPRESION, etiqueta: 'Depresión', color: COLOR_MARCA.fucsia },
  { id: TAB_GSHS, etiqueta: 'GSHS', color: COLOR_MARCA.verdeMenta },
];

export function ResumenFormularios({
  graficoClimaAula,
  graficoEstres,
  graficoAnsiedad,
  graficoDepresion,
  hayFiltrosActivos,
  hayPersonasFiltradas,
}) {
  const [pestanaActiva, setPestanaActiva] = useState(TAB_CLIMA_AULA);

  if (hayFiltrosActivos && !hayPersonasFiltradas) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-6">
        <p className="text-gray-500 font-medium">No hay estudiantes con estas características.</p>
      </div>
    );
  }

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

      {pestanaActiva === TAB_CLIMA_AULA && (
        <SeccionGraficoInstrumento titulo="Clima de Aula — por categoría" datos={graficoClimaAula} />
      )}

      {pestanaActiva === TAB_ESTRES && (
        <SeccionGraficoInstrumento titulo="Estrés (PSS-14) — por nivel" datos={graficoEstres} />
      )}

      {pestanaActiva === TAB_ANSIEDAD && (
        <SeccionGraficoInstrumento titulo="Ansiedad (BAI) — por nivel" datos={graficoAnsiedad} />
      )}

      {pestanaActiva === TAB_DEPRESION && (
        <SeccionGraficoInstrumento titulo="Depresión (BDI-II) — por nivel" datos={graficoDepresion} />
      )}

      {pestanaActiva === TAB_GSHS && (
        <div
          className={`bg-white rounded-lg shadow-xl border-t-8 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${COLOR_MARCA.verdeMenta.franja}`}
        >
          <div>
            <p className="text-gray-700 font-bold">GSHS</p>
            <p className="text-gray-500 text-sm mt-1">
              Porcentaje de riesgo por módulo entre tus estudiantes.
            </p>
          </div>
          <Link
            to="/dashboard/gshs"
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold shadow-sm transition-colors whitespace-nowrap ${COLOR_MARCA.verdeMenta.botonPrimario}`}
          >
            Ver resultados del GSHS
          </Link>
        </div>
      )}
    </div>
  );
}