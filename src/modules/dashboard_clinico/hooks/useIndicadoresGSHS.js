// Orquesta el cálculo de "% de riesgo por módulo" del GSHS (SCRUM-57):
// carga el catálogo de indicadores + las evaluaciones GSHS visibles (RLS
// ya resuelve el alcance — institución propia para el psicólogo, todas
// para el superadministrador), y agrega ambas cosas en memoria, mismo
// criterio que useResumenFormularios.js.
//
// El filtro de institución (`filtroInstitucion`) solo lo usa la pantalla
// del superadministrador (IndicadoresGSHSSuperadmin.jsx) — la pantalla
// del psicólogo (IndicadoresGSHS.jsx) nunca lo muestra porque un
// psicólogo solo puede estar vinculado a una institución (SCRUM-49), así
// que RLS ya devuelve exactamente "los estudiantes de su institución"
// sin necesidad de filtrar nada acá.
//
// PRIVACIDAD: este hook nunca expone `resultado_json` tal cual llega del
// servicio — solo lo usa dentro de calcularPorcentajesPorModulo para
// sumar conteos agregados. Ningún componente que consuma este hook
// recibe el detalle fila por fila.
import { useEffect, useMemo, useState } from 'react';
import { gshsIndicadoresService } from '../services/gshsIndicadoresService';

const FILTRO_INSTITUCION_TODAS = 'todas';

// Cuenta, para cada módulo del catálogo, cuántas de las respuestas
// válidas (indicador presente en resultado_json) cayeron en la
// categoría de riesgo, sobre el total de respuestas válidas de ese
// módulo — mismo criterio que describe el criterio de aceptación de
// SCRUM-55 ("el indicador de un módulo... porcentaje de estudiantes con
// respuesta de riesgo sobre el total de respuestas válidas de ese
// módulo"). El orden de los módulos en el resultado sigue el orden en
// que aparecen en `catalogo` (ya viene ordenado por `id` desde el
// servicio, que coincide con el orden real del instrumento).
function calcularPorcentajesPorModulo(evaluaciones, catalogo) {
  const modulosOrdenados = [];
  const codigosPorModulo = new Map();

  for (const { modulo, indicador_codigo: codigo } of catalogo) {
    if (!codigosPorModulo.has(modulo)) {
      codigosPorModulo.set(modulo, new Set());
      modulosOrdenados.push(modulo);
    }
    codigosPorModulo.get(modulo).add(codigo);
  }

  return modulosOrdenados.map((modulo) => {
    const codigos = codigosPorModulo.get(modulo);
    let riesgo = 0;
    let total = 0;

    for (const evaluacion of evaluaciones) {
      const resultado = evaluacion.resultado_json ?? {};
      for (const codigo of codigos) {
        if (!(codigo in resultado)) continue;
        total += 1;
        if (resultado[codigo] === true) riesgo += 1;
      }
    }

    const porcentaje = total > 0 ? Math.round((riesgo / total) * 1000) / 10 : 0;
    return { modulo, porcentaje, totalRespuestas: total };
  });
}

export function useIndicadoresGSHS() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroInstitucion, setFiltroInstitucion] = useState(FILTRO_INSTITUCION_TODAS);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setError(null);
        const [evals, cat] = await Promise.all([
          gshsIndicadoresService.obtenerEvaluacionesGSHS(),
          gshsIndicadoresService.obtenerCatalogoIndicadores(),
        ]);
        if (activo) {
          setEvaluaciones(evals);
          setCatalogo(cat);
        }
      } catch (err) {
        console.error('Error al cargar indicadores GSHS:', err.message);
        if (activo) setError('No se pudieron cargar los indicadores del GSHS.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  // Instituciones derivadas de las evaluaciones ya cargadas — mismo
  // criterio que Dashboard.jsx/PanelConsolidadoSuperadmin.jsx (sin
  // llamada nueva a Supabase ni import cruzado al módulo instituciones).
  const instituciones = useMemo(() => {
    const nombres = evaluaciones.map((e) => e.paciente?.institucion?.nombre).filter(Boolean);
    return Array.from(new Set(nombres)).sort((a, b) => a.localeCompare(b));
  }, [evaluaciones]);

  const evaluacionesFiltradas = useMemo(() => {
    if (filtroInstitucion === FILTRO_INSTITUCION_TODAS) return evaluaciones;
    return evaluaciones.filter((e) => e.paciente?.institucion?.nombre === filtroInstitucion);
  }, [evaluaciones, filtroInstitucion]);

  const modulos = useMemo(
    () => calcularPorcentajesPorModulo(evaluacionesFiltradas, catalogo),
    [evaluacionesFiltradas, catalogo]
  );

  return {
    modulos,
    totalEvaluaciones: evaluacionesFiltradas.length,
    loading,
    error,
    instituciones,
    filtroInstitucion,
    setFiltroInstitucion,
    FILTRO_INSTITUCION_TODAS,
  };
}