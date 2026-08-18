// Los 2 gráficos del panel de indicadores del psicólogo (historias
// "Conteo de formularios completados" + "Filtros de conteo por perfil"):
// distribución de Clima de Aula por categoría, y proporción de alertas
// del GSHS entre quienes ya lo completaron. No calcula nada acá — solo
// arma la descripción accesible y delega el dibujo a GraficoBarras
// (shared, no sabe nada de instrumentos clínicos).
import { GraficoBarras } from '../../../shared/components/GraficoBarras';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
        <p className="text-gray-700 font-bold mb-4">Clima de Aula — por categoría</p>
        <GraficoBarras
          datos={graficoClimaAula}
          descripcionAccesible={`Distribución de Clima de Aula por categoría: ${graficoClimaAula
            .map((d) => `${d.etiqueta} ${d.valor}`)
            .join(', ')}`}
        />
      </div>

      <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
        <p className="text-gray-700 font-bold mb-4">
          GSHS — {totalGshs} {totalGshs === 1 ? 'persona completó' : 'personas completaron'}
        </p>
        <GraficoBarras
          datos={graficoGshs}
          descripcionAccesible={`GSHS: ${graficoGshs.map((d) => `${d.etiqueta} ${d.valor}`).join(', ')}`}
        />
      </div>
    </div>
  );
}