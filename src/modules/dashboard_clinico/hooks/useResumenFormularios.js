// Deriva el conteo de formularios completados (Clima de Aula / GSHS) y
// aplica los filtros del panel de indicadores sobre el mismo listado que
// ya carga useListaPacientes — a propósito NO abre un segundo canal de
// Realtime ni una segunda consulta a Supabase: cuando useListaPacientes
// recarga tras una evaluación nueva, este hook recalcula solo vía
// useMemo sobre el array actualizado.
//
// Filtro independiente del buscador/filtro de institución que ya tiene
// Dashboard.jsx para la tabla: cuentan cosas distintas (personas que
// cumplen un perfil, acá; filas visibles en la tabla, allá), así que no
// comparten estado a propósito.
//
// tipoPersona (corrección de terminología Paciente → Estudiante): antes
// distinguía Participante/Consultante según tuviera institución. Se
// retiró (ver identidadUsuario.js) y se reemplazó por el mismo criterio
// que ya usaba Dashboard.jsx para su propio filtro (SCRUM-53):
// `paciente.tipoPersona` ('estudiante' | 'docente' | null), calculado
// por pacientesService.js según quién originó cada evaluación. Como ya
// no existe la categoría "sin institución", curso/paralelo/turno dejaron
// de ocultarse condicionalmente — siempre tienen sentido para cualquiera
// que aparezca en este listado.
import { useMemo, useState } from 'react';
import { COLOR_CATEGORIA_CLIMA_AULA, COLOR_ALERTA_GSHS } from '../../../shared/theme/paletaColores';

const TODOS = 'todos';

// Mismo orden que ya documenta climaAulaData.js (17-20 Muy positivo ...
// 0-4 Negativo) — de mejor a peor, para que el gráfico se lea en ese
// sentido. `lineas` corta a mano las etiquetas largas para
// GraficoBarrasVerticales (partir texto dentro de SVG no tiene una
// solución genérica simple).
const CATEGORIAS_CLIMA_AULA = [
  { etiqueta: 'Muy positivo', lineas: ['Muy', 'positivo'] },
  { etiqueta: 'Positivo', lineas: ['Positivo'] },
  { etiqueta: 'Medianamente favorable', lineas: ['Medianamente', 'favorable'] },
  { etiqueta: 'Poco favorable', lineas: ['Poco', 'favorable'] },
  { etiqueta: 'Negativo', lineas: ['Negativo'] },
];

// Mismos tramos de edad que la pregunta 1 del módulo demográfico del
// GSHS (ver evaluaciones/data/gshsData.js) — decisión explícita de la
// historia "Filtros de conteo por perfil", para que el panel hable el
// mismo idioma que el instrumento. Si esa pregunta cambia de opciones en
// gshsData.js, hay que actualizar esta lista también (mismo criterio de
// duplicación consciente que ya usa gshsData.js para las 3 preguntas del
// trigger de alerta — no hay una única fuente de verdad compartida).
const TRAMOS_EDAD = [
  { etiqueta: '11 años o menos', min: 0, max: 11 },
  { etiqueta: '12 años', min: 12, max: 12 },
  { etiqueta: '13 años', min: 13, max: 13 },
  { etiqueta: '14 años', min: 14, max: 14 },
  { etiqueta: '15 años', min: 15, max: 15 },
  { etiqueta: '16 años o más', min: 16, max: Infinity },
];

const FILTROS_INICIALES = {
  tipoPersona: TODOS, // 'todos' | 'estudiante' | 'docente' — mismos valores que ya usa Dashboard.jsx (SCRUM-53) para su propio filtro
  institucion: TODOS,
  sexo: TODOS,
  tramoEdad: TODOS,
  curso: TODOS,
  paralelo: TODOS,
  turno: TODOS,
  instrumento: TODOS, // 'todos' | 'CLIMA_AULA' | 'GSHS' | 'ESTRES' | 'ANSIEDAD' | 'DEPRESION' | 'ambos'
  fechaDesde: '',
  fechaHasta: '',
};

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumplioEsteAnio =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  return aunNoCumplioEsteAnio ? edad - 1 : edad;
}

// Deriva las opciones de un select a partir de lo que ya trae `pacientes`
// (mismo criterio que ya usaba Dashboard.jsx para su propio filtro de
// institución) — nada de esto pide datos nuevos a Supabase ni depende de
// una lista fija que se pueda desincronizar de lo que la gente eligió al
// registrarse.
function valoresUnicos(pacientes, campo) {
  const valores = pacientes.map((p) => p[campo]).filter(Boolean);
  return Array.from(new Set(valores)).sort((a, b) => a.localeCompare(b));
}

export function useResumenFormularios(pacientes) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  const actualizarFiltro = (campo, valor) => {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
  };

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  const hayFiltrosActivos = useMemo(
    () => Object.keys(FILTROS_INICIALES).some((campo) => filtros[campo] !== FILTROS_INICIALES[campo]),
    [filtros]
  );

  const instituciones = useMemo(
    () =>
      Array.from(new Set(pacientes.map((p) => p.institucion?.nombre).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [pacientes]
  );
  const generos = useMemo(() => valoresUnicos(pacientes, 'genero'), [pacientes]);
  const cursos = useMemo(() => valoresUnicos(pacientes, 'curso'), [pacientes]);
  const paralelos = useMemo(() => valoresUnicos(pacientes, 'paralelo'), [pacientes]);
  const turnos = useMemo(() => valoresUnicos(pacientes, 'turno'), [pacientes]);

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((paciente) => {
      if (filtros.tipoPersona !== TODOS && paciente.tipoPersona !== filtros.tipoPersona) return false;

      if (filtros.institucion !== TODOS && paciente.institucion?.nombre !== filtros.institucion) {
        return false;
      }

      if (filtros.sexo !== TODOS && paciente.genero !== filtros.sexo) return false;
      if (filtros.curso !== TODOS && paciente.curso !== filtros.curso) return false;
      if (filtros.paralelo !== TODOS && paciente.paralelo !== filtros.paralelo) return false;
      if (filtros.turno !== TODOS && paciente.turno !== filtros.turno) return false;

      if (filtros.tramoEdad !== TODOS) {
        const edad = calcularEdad(paciente.fecha_nacimiento);
        const tramo = TRAMOS_EDAD.find((t) => t.etiqueta === filtros.tramoEdad);
        if (edad === null || !tramo || edad < tramo.min || edad > tramo.max) return false;
      }

      const tiposCompletados = new Set((paciente.evaluaciones ?? []).map((e) => e.tipo_instrumento));

      if (filtros.instrumento === 'ambos' && !(tiposCompletados.has('CLIMA_AULA') && tiposCompletados.has('GSHS'))) {
        return false;
      }
      if (
        filtros.instrumento !== TODOS &&
        filtros.instrumento !== 'ambos' &&
        !tiposCompletados.has(filtros.instrumento)
      ) {
        return false;
      }

      if (filtros.fechaDesde || filtros.fechaHasta) {
        const tieneEnvioEnRango = (paciente.evaluaciones ?? []).some((evaluacion) => {
          const fecha = evaluacion.fecha_registro?.slice(0, 10);
          if (!fecha) return false;
          if (filtros.fechaDesde && fecha < filtros.fechaDesde) return false;
          if (filtros.fechaHasta && fecha > filtros.fechaHasta) return false;
          return true;
        });
        if (!tieneEnvioEnRango) return false;
      }

      return true;
    });
  }, [pacientes, filtros]);

  // Cuántas de las personas ya filtradas cayeron en cada categoría de
  // Clima de Aula — arma el arreglo con las 5 categorías siempre
  // presentes (en 0 si nadie cayó ahí), listo para GraficoBarrasVerticales
  // y GraficoDona.
  const graficoClimaAula = useMemo(() => {
    const conteoPorCategoria = Object.fromEntries(CATEGORIAS_CLIMA_AULA.map((c) => [c.etiqueta, 0]));

    for (const paciente of pacientesFiltrados) {
      const evaluacionClima = (paciente.evaluaciones ?? []).find((e) => e.tipo_instrumento === 'CLIMA_AULA');
      const categoria = evaluacionClima?.resultado_json?.categoria;
      if (categoria && categoria in conteoPorCategoria) {
        conteoPorCategoria[categoria] += 1;
      }
    }

    return CATEGORIAS_CLIMA_AULA.map(({ etiqueta, lineas }) => ({
      etiqueta,
      etiquetaLineas: lineas,
      valor: conteoPorCategoria[etiqueta],
      fill: COLOR_CATEGORIA_CLIMA_AULA[etiqueta].fill,
      stroke: COLOR_CATEGORIA_CLIMA_AULA[etiqueta].stroke,
      bg: COLOR_CATEGORIA_CLIMA_AULA[etiqueta].bg,
    }));
  }, [pacientesFiltrados]);

  // Cuántas de las personas ya filtradas que completaron el GSHS tienen
  // alerta activada o no. GSHS no genera categoría (ver nota en
  // gshsData.js) — este sigue siendo el único desglose de GSHS que
  // muestra ESTE panel resumen. El desglose de "% de riesgo por módulo"
  // (SCRUM-57, autorizado por la Licenciada como agregado entre varios
  // estudiantes) vive en su propia sección dedicada
  // (dashboard_clinico/pages/IndicadoresGSHS.jsx), no acá — este panel
  // resumen no lo necesita duplicar.
  const graficoGshs = useMemo(() => {
    let sinAlerta = 0;
    let conAlerta = 0;

    for (const paciente of pacientesFiltrados) {
      const evaluacionGshs = (paciente.evaluaciones ?? []).find((e) => e.tipo_instrumento === 'GSHS');
      if (!evaluacionGshs) continue;
      if (evaluacionGshs.alerta_activada) conAlerta += 1;
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
  }, [pacientesFiltrados]);

  return {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    hayFiltrosActivos,
    instituciones,
    generos,
    cursos,
    paralelos,
    turnos,
    tramosEdad: TRAMOS_EDAD.map((t) => t.etiqueta),
    graficoClimaAula,
    graficoGshs,
    hayPersonasFiltradas: pacientesFiltrados.length > 0,
  };
}