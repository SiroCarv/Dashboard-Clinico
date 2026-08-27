// Lista de barras horizontales genérica, en HTML/CSS (no SVG) — a
// diferencia de GraficoBarrasVerticales.jsx/GraficoDona.jsx, acá las
// etiquetas pueden ser largas (ver dashboard_clinico/components/
// GraficoModulosGSHS.jsx: nombres de módulo de hasta ~115 caracteres), y
// partir texto largo dentro de un SVG no tiene una solución genérica
// simple (mismo problema ya documentado en GraficoBarrasVerticales.jsx).
// El texto en HTML envuelve solo, sin cortar líneas a mano, y es
// nativamente accesible para lectores de pantalla — no hace falta un
// aria-label describiendo todo el gráfico, como sí necesitan los SVG.
//
// No sabe nada de ningún dominio clínico — solo recibe datos ya
// resueltos por quien lo usa. `bg` debe ser una clase Tailwind completa
// (ej. "bg-emerald-500"), nunca construida con un template string, para
// que el escaneo de Tailwind la detecte (mismo criterio que el resto de
// los gráficos de shared/).
export function GraficoBarrasHorizontales({ datos, sufijo = '', maximo = 100 }) {
  return (
    <ul className="space-y-3">
      {datos.map((item) => {
        const anchoPorcentaje = maximo > 0 ? Math.min((item.valor / maximo) * 100, 100) : 0;

        return (
          <li key={item.etiqueta} title={item.tituloCompleto ?? item.etiqueta}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-sm font-semibold text-gray-800">{item.etiqueta}</span>
              <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                {item.valor}
                {sufijo}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className={`h-3 rounded-full ${item.bg}`} style={{ width: `${anchoPorcentaje}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}