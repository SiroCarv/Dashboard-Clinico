// Tarjeta de indicadores GSHS por módulo (SCRUM-57): un gráfico de
// barras horizontales con el porcentaje de respuestas de riesgo de cada
// uno de los 11 módulos del cuestionario, calculado sobre las
// evaluaciones visibles para quien mira la pantalla (RLS ya resuelve el
// alcance: institución propia para el psicólogo, todas o la
// seleccionada para el superadministrador — ver useIndicadoresGSHS.js).
//
// NUNCA recibe ni muestra `resultado_json` fila por fila — solo el
// porcentaje ya agregado entre todas las evaluaciones del alcance
// vigente. Esto es justamente lo que la Licenciada autorizó para
// SCRUM-57: agregados por módulo sí, resultado individual de un
// estudiante no (ver notas actualizadas en resultadosGlobalesService.js,
// TablaResultadosGlobales.jsx y useResumenFormularios.js).
//
// ETIQUETAS_CORTAS es una decisión de presentación (los nombres de
// módulo oficiales de evaluaciones/data/gshsData.js son demasiado largos
// para una barra, hasta ~115 caracteres), no de contenido clínico — el
// nombre completo real sigue disponible en el atributo `title` (tooltip
// nativo) de cada fila. Si gshsData.js cambia el texto de un módulo, hay
// que actualizar este mapa también (misma duplicación consciente que ya
// documenta useResumenFormularios.js para TRAMOS_EDAD).
import { GraficoBarrasHorizontales } from '../../../shared/components/GraficoBarrasHorizontales';
import { COLOR_MODULOS_GSHS } from '../../../shared/theme/paletaColores';

const ETIQUETAS_CORTAS = {
  'Módulo sobre Uso de Alcohol': 'Alcohol',
  'Módulo sobre Conductas Alimentarias': 'Conductas alimentarias',
  'Módulo sobre Uso de Drogas': 'Drogas',
  'Módulo sobre Higiene': 'Higiene',
  'Módulo sobre Salud Mental': 'Salud mental',
  'Módulo sobre Actividad Física': 'Actividad física',
  'Módulo sobre Factores Protectores': 'Factores protectores',
  'Módulo sobre Comportamientos Sexuales que Contribuyen a la Infección por VIH, Otras ITS y Embarazos No Planeados':
    'Comportamientos sexuales',
  'Módulo sobre el Consumo de Tabaco': 'Tabaco',
  'Módulo sobre Violencia y Lesiones No Intencionales': 'Violencia y lesiones',
  'Módulo Básico Opcional (VIH/SIDA) — para contextos donde no se aplican preguntas sobre comportamiento sexual':
    'VIH/SIDA (módulo opcional)',
};

export function GraficoModulosGSHS({ modulos, totalEvaluaciones }) {
  if (totalEvaluaciones === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">Todavía no hay evaluaciones del GSHS registradas.</p>
      </div>
    );
  }

  const datos = modulos.map((m) => ({
    etiqueta: ETIQUETAS_CORTAS[m.modulo] ?? m.modulo,
    tituloCompleto: m.modulo,
    valor: m.porcentaje,
    bg: COLOR_MODULOS_GSHS.bg,
  }));

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
      <p className="text-gray-700 font-bold mb-1">Porcentaje de riesgo por módulo — GSHS</p>
      <p className="text-gray-500 text-sm mb-4">
        {totalEvaluaciones} {totalEvaluaciones === 1 ? 'evaluación considerada' : 'evaluaciones consideradas'}
      </p>
      <GraficoBarrasHorizontales datos={datos} sufijo="%" />
    </div>
  );
}