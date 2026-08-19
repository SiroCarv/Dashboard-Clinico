// Gráfico de dona genérico, en SVG a mano (sin librería) — usa la
// técnica de varios <circle> apilados con stroke-dasharray/dashoffset en
// vez de calcular arcos con trigonometría manual; es la forma estándar
// de armar una dona sin dependencias.
//
// Diseño (ajustado a pedido de la Licenciada, Sprint 5): cada segmento
// muestra su propio porcentaje escrito encima, con un pequeño espacio en
// blanco entre segmentos y el centro vacío — antes el centro mostraba el
// total y no había porcentajes sobre la dona. Las cantidades exactas
// (no solo el %) se mantienen en la leyenda de abajo, que no cambió de
// lugar.
//
// No sabe nada de ningún dominio clínico. `stroke`/`bg` deben ser clases
// Tailwind completas (ej. "stroke-green-500", "bg-green-500") — la dona
// dibuja cada arco como un <circle fill="none"> y recorta el trazo con
// stroke-dasharray/dashoffset, así que necesita el color en `stroke`, NO
// en `fill` (`fill` pintaría el círculo COMPLETO relleno, tapando los
// demás arcos — bug real que tenía esta versión y que se corrigió en el
// Sprint 5, ver paletaColores.js). La leyenda de abajo usa `bg` para el
// punto de color, porque background-color no pinta un <circle> de SVG
// pero sí un <span> normal.

// Espacio en blanco entre segmentos, en unidades de longitud de arco (que
// acá equivalen a píxeles porque el viewBox coincide 1:1 con `tamano`).
// Fijo y chico a propósito: con pocos segmentos (2 a 5, los únicos casos
// reales del proyecto) alcanza para separarlos visualmente sin comerse
// arco de los segmentos más chicos.
const ESPACIO_ENTRE_SEGMENTOS = 3;

// Debajo de este porcentaje no se dibuja la etiqueta encima del segmento:
// con un arco tan angosto el número ya no entra sin superponerse con el
// del segmento vecino. La cantidad exacta de esos casos sigue disponible
// en la leyenda de abajo.
const PORCENTAJE_MINIMO_PARA_ETIQUETA = 6;

export function GraficoDona({ datos, descripcionAccesible, tamano = 150, grosor = 22 }) {
  const total = datos.reduce((suma, item) => suma + item.valor, 0);
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const segmentosVisibles = datos.filter((item) => item.valor > 0);
  const espacio = segmentosVisibles.length > 1 ? ESPACIO_ENTRE_SEGMENTOS : 0;
  let acumulado = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" aria-label={descripcionAccesible}>
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          className="stroke-gray-100"
          strokeWidth={grosor}
        />
        {total > 0 &&
          segmentosVisibles.map((item) => {
            // Se calcula sobre el largo COMPLETO de la porción (sin el
            // recorte del espacio) para que el punto medio —y por lo
            // tanto la etiqueta— quede centrado en la porción real, no en
            // el arco ya recortado.
            const largoCompleto = (item.valor / total) * circunferencia;
            const inicio = acumulado;
            acumulado += largoCompleto;

            const largoVisible = Math.max(largoCompleto - espacio, 0);
            const offsetVisible = inicio + espacio / 2;

            // Un <circle> sin transformar empieza a las 3 en punto y
            // avanza en sentido horario a medida que crece la longitud
            // recorrida; se resta 90° para que el punto de partida quede
            // a las 12, igual que el `rotate(-90)` que ya usaba el trazo.
            const anguloMedioGrados = ((inicio + largoCompleto / 2) / circunferencia) * 360 - 90;
            const anguloMedioRad = (anguloMedioGrados * Math.PI) / 180;
            const xEtiqueta = tamano / 2 + radio * Math.cos(anguloMedioRad);
            const yEtiqueta = tamano / 2 + radio * Math.sin(anguloMedioRad);
            const porcentaje = Math.round((item.valor / total) * 100);

            return (
              <g key={item.etiqueta}>
                <circle
                  cx={tamano / 2}
                  cy={tamano / 2}
                  r={radio}
                  fill="none"
                  strokeWidth={grosor}
                  strokeDasharray={`${largoVisible} ${circunferencia - largoVisible}`}
                  strokeDashoffset={-offsetVisible}
                  transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
                  className={item.stroke}
                />
                {porcentaje >= PORCENTAJE_MINIMO_PARA_ETIQUETA && (
                  <text
                    x={xEtiqueta}
                    y={yEtiqueta}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-900 text-[11px] font-bold"
                  >
                    {porcentaje}%
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 justify-center">
        {datos.map((item) => (
          <span key={item.etiqueta} className="flex items-center gap-1.5 text-xs font-semibold text-black">
            <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
            {item.etiqueta} ({item.valor})
          </span>
        ))}
      </div>
    </div>
  );
}