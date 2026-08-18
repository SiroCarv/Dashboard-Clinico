// Gráfico de barras horizontales genérico, hecho con divs + Tailwind (sin
// librería de gráficos). Horizontales a propósito: con etiquetas de texto
// largas ("Medianamente favorable") un gráfico de barras verticales
// obligaría a rotar las etiquetas o truncarlas.
//
// No sabe nada de ningún dominio clínico — solo recibe etiqueta/valor/
// color ya resueltos por quien lo usa (ver dashboard_clinico/components/
// ResumenFormularios.jsx para el caso de uso real). `color` debe ser una
// clase Tailwind completa (ej. "bg-green-500"), nunca construida con un
// template string, para que el escaneo de Tailwind la detecte — mismo
// criterio que ya usa paletaColores.js.
export function GraficoBarras({ datos, descripcionAccesible }) {
  const maximo = Math.max(...datos.map((d) => d.valor), 1);

  return (
    <div role="img" aria-label={descripcionAccesible} className="space-y-3">
      {datos.map((item) => (
        <div key={item.etiqueta}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">{item.etiqueta}</span>
            <span className="text-gray-900 font-bold">{item.valor}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${item.color}`}
              style={{ width: `${(item.valor / maximo) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}