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
//
// Curso/paralelo/turno (corrección posterior): antes se derivaban de
// `valoresUnicos(pacientes, campo)`, mostrando solo los valores que ya
// existían entre los estudiantes cargados. Ahora usan las mismas listas
// fijas que ya usaba Dashboard.jsx para el filtro de su propia tabla
// (ver opcionesEscolares.js) — evita que ambos filtros de la misma
// pantalla muestren conjuntos de opciones distintos.
//
// Institución (corrección posterior): se retiró el filtro de
// institución de acá y de Dashboard.jsx — un psicólogo solo puede estar
// vinculado a una institución (SCRUM-49), así que filtrar por
// institución nunca reduce nada para quien usa esta pantalla. La
// columna Institución sigue visible en la tabla (TablaPacientes.jsx),
// solo se quitó el control de filtro.
//
// Tipo de persona (corrección posterior): se retiró también este filtro
// de acá y de Dashboard.jsx, a pedido del cliente. `tipoPersona` sigue
// calculándose en pacientesService.js y mostrándose como etiqueta junto
// al nombre en TablaPacientes.jsx — solo se quitó el control de filtro,
// no el dato ni la etiqueta.
import { useMemo, useState } from 'react';
import {
  COLOR_CATEGORIA_CLIMA_AULA,
  COLOR_CATEGORIA_ESTRES,
  COLOR_CATEGORIA_ANSIEDAD,
  COLOR_CATEGORIA_DEPRESION,
} from '../../../shared/theme/paletaColores';
import { OPCIONES_CURSO, OPCIONES_PARALELO, OPCIONES_TURNO } from '../data/opcionesEscolares';

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

// Mismos 4 textos exactos que arma el trigger calcular_resultado_
// instrumento en Supabase para tipo_instrumento = 'ESTRES' (Escala de
// Estrés Percibido / PSS-14) — verificados contra la función real, no
// copiados de la referencia informativa del instrumento
// (evaluaciones/data/estresData.js), para no arriesgar un typo que rompa
// la comparación de categorías. Orden de mejor a peor, igual que
// CATEGORIAS_CLIMA_AULA.
const CATEGORIAS_ESTRES = [
  { etiqueta: 'Nivel bajo', lineas: ['Nivel', 'bajo'] },
  { etiqueta: 'Nivel medio', lineas: ['Nivel', 'medio'] },
  { etiqueta: 'Nivel alto', lineas: ['Nivel', 'alto'] },
  { etiqueta: 'Nivel muy alto', lineas: ['Nivel', 'muy alto'] },
];

// Mismo criterio que CATEGORIAS_ESTRES, para tipo_instrumento =
// 'ANSIEDAD' (Inventario de Ansiedad de Beck / BAI).
const CATEGORIAS_ANSIEDAD = [
  { etiqueta: 'No presenta ansiedad', lineas: ['No presenta', 'ansiedad'] },
  { etiqueta: 'Ansiedad leve', lineas: ['Ansiedad', 'leve'] },
  { etiqueta: 'Ansiedad moderada', lineas: ['Ansiedad', 'moderada'] },
  { etiqueta: 'Ansiedad grave', lineas: ['Ansiedad', 'grave'] },
];

// Mismo criterio que CATEGORIAS_ESTRES, para tipo_instrumento =
// 'DEPRESION' (Inventario de Depresión de Beck II / BDI-II).
const CATEGORIAS_DEPRESION = [
  { etiqueta: 'Depresión mínima', lineas: ['Depresión', 'mínima'] },
  { etiqueta: 'Depresión leve o media', lineas: ['Depresión', 'leve o media'] },
  { etiqueta: 'Depresión moderada', lineas: ['Depresión', 'moderada'] },
  { etiqueta: 'Depresión severa', lineas: ['Depresión', 'severa'] },
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
  sexo: TODOS,
  tramoEdad: TODOS,
  curso: TODOS,
  paralelo: TODOS,
  turno: TODOS,
  instrumento: TODOS, // 'todos' | 'CLIMA_AULA' | 'GSHS' | 'ESTRES' | 'ANSIEDAD' | 'DEPRESION'
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

// Cuenta, para un instrumento con categorías fijas calculadas por el
// trigger (a diferencia de GSHS, que no calcula ninguna), cuántas de las
// personas ya filtradas que lo completaron cayeron en cada categoría.
// Estrés, Ansiedad y Depresión comparten exactamente esta forma — solo
// cambian el tipo de instrumento, la lista de categorías y sus colores —
// así que se extrae acá en vez de repetir el mismo bucle 3 veces. Clima
// de Aula (graficoClimaAula, más abajo) se deja como estaba, sin migrar a
// este helper, para no tocar código ya auditado que no forma parte de
// este cambio.
function contarPorCategoria(pacientesFiltrados, tipoInstrumento, categorias, colores) {
  const conteoPorCategoria = Object.fromEntries(categorias.map((c) => [c.etiqueta, 0]));

  for (const paciente of pacientesFiltrados) {
    const evaluacion = (paciente.evaluaciones ?? []).find((e) => e.tipo_instrumento === tipoInstrumento);
    const categoria = evaluacion?.resultado_json?.categoria;
    if (categoria && categoria in conteoPorCategoria) {
      conteoPorCategoria[categoria] += 1;
    }
  }

  return categorias.map(({ etiqueta, lineas }) => ({
    etiqueta,
    etiquetaLineas: lineas,
    valor: conteoPorCategoria[etiqueta],
    fill: colores[etiqueta].fill,
    stroke: colores[etiqueta].stroke,
    bg: colores[etiqueta].bg,
  }));
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

  const generos = useMemo(() => valoresUnicos(pacientes, 'genero'), [pacientes]);
  const cursos = OPCIONES_CURSO;
  const paralelos = OPCIONES_PARALELO;
  const turnos = OPCIONES_TURNO;

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((paciente) => {
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

      if (filtros.instrumento !== TODOS && !tiposCompletados.has(filtros.instrumento)) {
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

  // GSHS ya no tiene un gráfico propio en este panel resumen (retirado:
  // duplicaba el mismo resumen con/sin alerta que ya muestra
  // IndicadoresGSHS.jsx). La pestaña de GSHS en ResumenFormularios.jsx
  // ahora es un acceso directo a esa pantalla dedicada, no un gráfico —
  // por eso este hook ya no calcula nada para GSHS.
  const graficoEstres = useMemo(
    () => contarPorCategoria(pacientesFiltrados, 'ESTRES', CATEGORIAS_ESTRES, COLOR_CATEGORIA_ESTRES),
    [pacientesFiltrados]
  );

  const graficoAnsiedad = useMemo(
    () => contarPorCategoria(pacientesFiltrados, 'ANSIEDAD', CATEGORIAS_ANSIEDAD, COLOR_CATEGORIA_ANSIEDAD),
    [pacientesFiltrados]
  );

  const graficoDepresion = useMemo(
    () => contarPorCategoria(pacientesFiltrados, 'DEPRESION', CATEGORIAS_DEPRESION, COLOR_CATEGORIA_DEPRESION),
    [pacientesFiltrados]
  );

  return {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    hayFiltrosActivos,
    generos,
    cursos,
    paralelos,
    turnos,
    tramosEdad: TRAMOS_EDAD.map((t) => t.etiqueta),
    graficoClimaAula,
    graficoEstres,
    graficoAnsiedad,
    graficoDepresion,
    hayPersonasFiltradas: pacientesFiltrados.length > 0,
  };
}