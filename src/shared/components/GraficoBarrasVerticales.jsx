// Gráfico de barras verticales genérico, en SVG a mano (sin librería) —
// con línea base y valor sobre cada barra. Verticales a propósito para
// el panel de indicadores: junto con GraficoDona.jsx, da la vista de
// "cantidad absoluta" mientras la dona da la de "proporción del total".
//
// No sabe nada de ningún dominio clínico — solo recibe datos ya
// resueltos por quien lo usa (ver dashboard_clinico/components/
// ResumenFormularios.jsx). `fill` debe ser una clase Tailwind completa
// (ej. "fill-green-500"), nunca construida con un template string, para
// que el escaneo de Tailwind la detecte.
//
// `etiquetaLineas` es opcional: un arreglo de líneas ya partidas por
// quien arma los datos (ej. ['Medianamente', 'favorable']), porque partir
// texto en múltiples líneas dentro de SVG no tiene una solución genérica
// simple — quien conoce las etiquetas reales decide dónde cortarlas.
export function GraficoBarrasVerticales({ datos, descripcionAccesible, alto = 190 }) {
  const ancho = 300;
  const altoUtil = alto - 34;
  const maximo = Math.max(...datos.map((d) => d.valor), 1);
  const anchoColumna = ancho / datos.length;

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      width="100%"
      height={alto}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={descripcionAccesible}
    >
      <line x1="0" y1={altoUtil} x2={ancho} y2={altoUtil} className="stroke-gray-300" strokeWidth="1" />

      {datos.map((item, indice) => {
        const anchoBarra = anchoColumna * 0.55;
        const x = indice * anchoColumna + (anchoColumna - anchoBarra) / 2;
        const alturaBarra = (item.valor / maximo) * (altoUtil - 24);
        const y = altoUtil - alturaBarra;
        const lineas = item.etiquetaLineas ?? [item.etiqueta];

        return (
          <g key={item.etiqueta}>
            <rect x={x} y={y} width={anchoBarra} height={Math.max(alturaBarra, 0)} rx="3" className={item.fill} />
            <text x={x + anchoBarra / 2} y={y - 6} textAnchor="middle" className="fill-gray-900 text-[11px] font-bold">
              {item.valor}
            </text>
            {lineas.map((linea, indiceLinea) => (
              <text
                key={linea}
                x={x + anchoBarra / 2}
                y={altoUtil + 13 + indiceLinea * 10}
                textAnchor="middle"
                className="fill-gray-600 text-[9px]"
              >
                {linea}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}