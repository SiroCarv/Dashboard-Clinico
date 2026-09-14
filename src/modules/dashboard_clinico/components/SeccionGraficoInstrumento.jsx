// Tarjeta con un gráfico de barras verticales (cantidad absoluta) y uno
// de dona (proporción del total) lado a lado — a propósito los dos, no
// uno solo: dan lecturas distintas de los mismos datos. Extraído de
// ResumenFormularios.jsx para reutilizarlo también en la pestaña GSHS de
// IndicadoresGSHS.jsx (psicólogo) y en la pestaña Gráficas de
// PanelConsolidadoSuperadmin.jsx (superadmin), que hasta ahora solo
// mostraban el desglose por módulo en barras horizontales
// (GraficoModulosGSHS) y no tenían este segundo tipo de vista para el
// resumen de alerta activada / sin alerta.
//
// No calcula nada acá, solo arma la descripción accesible y delega el
// dibujo a los componentes genéricos de shared/ (no saben nada de
// instrumentos clínicos).
import { GraficoBarrasVerticales } from '../../../shared/components/GraficoBarrasVerticales';
import { GraficoDona } from '../../../shared/components/GraficoDona';

export function SeccionGraficoInstrumento({ titulo, datos }) {
  // Guarda defensiva (bug real: pantalla en blanco al abrir la pestaña
  // "Riesgo Suicida" en el Panel Consolidado del superadmin — ver
  // PanelConsolidadoSuperadmin.jsx). Antes este componente asumía que
  // `datos` siempre llegaba como un arreglo ya armado; si llega
  // `undefined` (ej. una prop que se olvidó pasar, como pasó acá) o
  // vacío, el `.map()` de acá abajo y el de los 2 componentes hijos
  // (GraficoBarrasVerticales/GraficoDona) hacían caer el render entero
  // sin ningún mensaje de error, en vez de mostrar un estado vacío como
  // ya hace el resto de la app (ej. "No hay estudiantes con estas
  // características" en ResumenFormularios.jsx).
  if (!datos || datos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
        <p className="text-gray-700 font-bold mb-4">{titulo}</p>
        <p className="text-gray-500 text-sm text-center py-6">
          No hay datos disponibles para este formulario todavía.
        </p>
      </div>
    );
  }

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