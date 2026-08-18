// Los indicadores del panel del psicólogo (historias "Conteo de
// formularios completados" + "Filtros de conteo por perfil"): por cada
// instrumento, un gráfico de barras verticales (cantidad absoluta) y uno
// de dona (proporción del total) — a propósito los dos, no uno solo:
// dan lecturas distintas de los mismos datos. No calcula nada acá, solo
// arma la descripción accesible y delega el dibujo a los componentes
// genéricos de shared/ (no saben nada de instrumentos clínicos).
import { GraficoBarrasVerticales } from '../../../shared/components/GraficoBarrasVerticales';
import { GraficoDona } from '../../../shared/components/GraficoDona';

function SeccionInstrumento({ titulo, datos }) {
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

export function ResumenFormularios({ graficoClimaAula, graficoGshs, hayFiltrosActivos, hayPersonasFiltradas }) {
  if (hayFiltrosActivos && !hayPersonasFiltradas) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-6">
        <p className="text-gray-500 font-medium">
          No hay participantes ni consultantes con estas características.
        </p>
      </div>
    );
  }

  const totalGshs = graficoGshs.reduce((suma, item) => suma + item.valor, 0);

  return (
    <div className="space-y-4 mb-6">
      <SeccionInstrumento titulo="Clima de Aula — por categoría" datos={graficoClimaAula} />
      <SeccionInstrumento
        titulo={`GSHS — ${totalGshs} ${totalGshs === 1 ? 'persona completó' : 'personas completaron'}`}
        datos={graficoGshs}
      />
    </div>
  );
}