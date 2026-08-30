// Tarjeta con un gráfico de barras verticales (cantidad absoluta) y uno
// de dona (proporción del total) lado a lado — a propósito los dos, no
// uno solo: dan lecturas distintas de los mismos datos. Extraído de
// ResumenFormularios.jsx para reutilizarlo también en las pantallas de
// Resultados GSHS (IndicadoresGSHS.jsx / IndicadoresGSHSSuperadmin.jsx),
// que hasta ahora solo mostraban el desglose por módulo en barras
// horizontales (GraficoModulosGSHS) y no tenían este segundo tipo de
// vista para el resumen de alerta activada / sin alerta.
//
// No calcula nada acá, solo arma la descripción accesible y delega el
// dibujo a los componentes genéricos de shared/ (no saben nada de
// instrumentos clínicos).
import { GraficoBarrasVerticales } from '../../../shared/components/GraficoBarrasVerticales';
import { GraficoDona } from '../../../shared/components/GraficoDona';

export function SeccionGraficoInstrumento({ titulo, datos }) {
  const descripcion = `${titulo}: ${datos.map((d) => `${d.etiqueta} ${d.valor}`).join(', ')}`;

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
      <p className="text-gray-700 font-bold mb-4">{titulo}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <GraficoBarrasVerticales datos={datos} descripcionAccesible={descripcion} />
        <GraficoDona datos={datos} descripcionAccesible={descripcion} />
      </div>
    </div>
  );
}
