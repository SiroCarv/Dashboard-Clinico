// Gráfico de dona genérico, en SVG a mano (sin librería) — usa la
// técnica de varios <circle> apilados con stroke-dasharray/dashoffset en
// vez de calcular arcos con trigonometría manual; es la forma estándar
// de armar una dona sin dependencias.
//
// No sabe nada de ningún dominio clínico. `fill`/`bg` deben ser clases
// Tailwind completas (ej. "fill-green-500", "bg-green-500") — la dona
// usa `fill` como color de trazo (sirve igual para stroke) y la leyenda
// de abajo usa `bg` para el punto de color, porque background-color no
// pinta un <circle> de SVG pero sí un <span> normal.
export function GraficoDona({ datos, descripcionAccesible, tamano = 150, grosor = 22 }) {
  const total = datos.reduce((suma, item) => suma + item.valor, 0);
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" aria-label={descripcionAccesible}>
        <g transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}>
          <circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={radio}
            fill="none"
            className="stroke-gray-100"
            strokeWidth={grosor}
          />
          {total > 0 &&
            datos
              .filter((item) => item.valor > 0)
              .map((item) => {
                const largo = (item.valor / total) * circunferencia;
                const offset = acumulado;
                acumulado += largo;
                return (
                  <circle
                    key={item.etiqueta}
                    cx={tamano / 2}
                    cy={tamano / 2}
                    r={radio}
                    fill="none"
                    strokeWidth={grosor}
                    strokeDasharray={`${largo} ${circunferencia - largo}`}
                    strokeDashoffset={-offset}
                    className={item.fill}
                  />
                );
              })}
        </g>
        <text x={tamano / 2} y={tamano / 2} textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 text-[15px] font-bold">
          {total}
        </text>
      </svg>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 justify-center">
        {datos.map((item) => (
          <span key={item.etiqueta} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
            {item.etiqueta} ({item.valor})
          </span>
        ))}
      </div>
    </div>
  );
}