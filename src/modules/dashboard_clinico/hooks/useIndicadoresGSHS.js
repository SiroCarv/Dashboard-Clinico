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
// Institución (corrección posterior a SCRUM-57): las opciones de este
// filtro YA NO se derivan de las evaluaciones GSHS ya cargadas — eso
// dejaba afuera a cualquier institución sin evaluaciones de GSHS
// todavía. Ahora vienen del catálogo completo (useInstitucionesCatalogo,
// mismo que usa PanelConsolidadoSuperadmin.jsx), consultado directo al
// módulo `instituciones` a través de su API pública.
//
// PRIVACIDAD: este hook nunca expone `resultado_json` tal cual llega del
// servicio — solo lo usa dentro de calcularPorcentajesPorModulo para
// sumar conteos agregados. Ningún componente que consuma este hook
// recibe el detalle fila por fila.
import { useEffect, useMemo, useState } from 'react';
import { gshsIndicadoresService } from '../services/gshsIndicadoresService';
import { useInstitucionesCatalogo } from './useInstitucionesCatalogo';
import { COLOR_ALERTA_GSHS } from '../../../shared/theme/paletaColores';

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
  const { instituciones } = useInstitucionesCatalogo();

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

  const evaluacionesFiltradas = useMemo(() => {
    if (filtroInstitucion === FILTRO_INSTITUCION_TODAS) return evaluaciones;
    return evaluaciones.filter((e) => e.paciente?.institucion?.nombre === filtroInstitucion);
  }, [evaluaciones, filtroInstitucion]);

  const modulos = useMemo(
    () => calcularPorcentajesPorModulo(evaluacionesFiltradas, catalogo),
    [evaluacionesFiltradas, catalogo]
  );

  // Barras + dona de "con alerta / sin alerta" (corrección posterior a
  // SCRUM-57): mismo criterio de 2 categorías que useResumenFormularios.js
  // usaba antes para su propio resumen de GSHS en el panel del psicólogo
  // (retirado de ahí más adelante para no duplicar esta pantalla, ver
  // nota en ese archivo) — acá suma sobre TODAS las evaluaciones del
  // alcance vigente (institución propia para el psicólogo, todas o la
  // elegida para el superadministrador), no solo sobre pacientes visibles
  // en un listado.
  const resumenAlerta = useMemo(() => {
    let conAlerta = 0;
    let sinAlerta = 0;

    for (const evaluacion of evaluacionesFiltradas) {
      if (evaluacion.alerta_activada) conAlerta += 1;
      else sinAlerta += 1;
    }

    return [
      {
        etiqueta: 'Sin alerta',
        etiquetaLineas: ['Sin alerta'],
        valor: sinAlerta,
        fill: COLOR_ALERTA_GSHS.sinAlerta.fill,
        stroke: COLOR_ALERTA_GSHS.sinAlerta.stroke,
        bg: COLOR_ALERTA_GSHS.sinAlerta.bg,
      },
      {
        etiqueta: 'Con alerta activada',
        etiquetaLineas: ['Con alerta', 'activada'],
        valor: conAlerta,
        fill: COLOR_ALERTA_GSHS.conAlerta.fill,
        stroke: COLOR_ALERTA_GSHS.conAlerta.stroke,
        bg: COLOR_ALERTA_GSHS.conAlerta.bg,
      },
    ];
  }, [evaluacionesFiltradas]);

  return {
    modulos,
    resumenAlerta,
    totalEvaluaciones: evaluacionesFiltradas.length,
    loading,
    error,
    instituciones,
    filtroInstitucion,
    setFiltroInstitucion,
    FILTRO_INSTITUCION_TODAS,
  };
}