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
