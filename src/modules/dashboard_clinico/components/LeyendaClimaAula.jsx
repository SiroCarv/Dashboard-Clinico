// Leyenda de resultados de Clima de Aula (SCRUM-58).
//
// Antes, el único resultado visible para el psicólogo era una pastilla
// suelta ("18/20 — Muy positivo", ver ResumenInstrumento en
// InformeConsolidadoPaciente.jsx) sin ningún punto de referencia: había
// que saber de memoria qué tan bueno o malo es ese puntaje. Este
// componente no reemplaza esa pastilla (se deja igual, es un resumen
// rápido válido) — agrega, debajo del encabezado de la tarjeta, los 5
// niveles siempre visibles y en orden, con el nivel obtenido remarcado,
// para que interpretar el resultado no dependa de memorizar los rangos.
//
// Los 5 niveles y sus rangos vienen de NIVELES_CLIMA_AULA (API pública
// del módulo `evaluaciones` — nunca se hardcodean acá números que ya
// existen como fuente única de verdad en ese módulo, ver
// evaluaciones/data/climaAulaData.js). El color de cada nivel viene de
// paletaColores.js (mismo criterio semántico que ya usa el resto de la
// app: verde = bien, gris = neutro, amarillo/rojo = atención) — este
// componente no inventa ningún color nuevo.
import { NIVELES_CLIMA_AULA } from '../../evaluaciones';
import { COLOR_CATEGORIA_CLIMA_AULA, ESTILOS_CATEGORIA_CLIMA_AULA } from '../../../shared/theme/paletaColores';

const ESTILO_NIVEL_NO_ACTUAL = 'border border-transparent text-gray-500';

export default function LeyendaClimaAula({ categoria }) {
  return (
    <div className="px-5 pb-4 -mt-1">
      <ul className="border border-gray-200 rounded-md p-2.5 bg-white flex flex-col gap-1">
        {NIVELES_CLIMA_AULA.map((nivel) => {
          const esNivelActual = nivel.categoria === categoria;
          const colorPunto = COLOR_CATEGORIA_CLIMA_AULA[nivel.categoria]?.bg ?? 'bg-gray-400';
          const estiloFila = esNivelActual
            ? `${ESTILOS_CATEGORIA_CLIMA_AULA[nivel.categoria] ?? 'bg-gray-100 border-gray-300 text-gray-800'} border-2 font-extrabold`
            : ESTILO_NIVEL_NO_ACTUAL;

          return (
            <li
              key={nivel.categoria}
              aria-current={esNivelActual ? 'true' : undefined}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${estiloFila}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorPunto}`} aria-hidden="true" />
              <span className="flex-1">
                {nivel.categoria}
                {esNivelActual && <span className="sr-only"> (resultado obtenido)</span>}
              </span>
              <span className="text-xs font-semibold whitespace-nowrap">
                {nivel.puntajeMinimo}–{nivel.puntajeMaximo} pts
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}