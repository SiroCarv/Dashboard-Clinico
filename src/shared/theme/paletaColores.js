// Paleta de colores institucional (UNIFRANZ) — referencia única y
// centralizada para toda la plataforma. Ningún componente escribe un
// color de marca directo (ej. "bg-orange-700"); siempre importa un
// bloque de este archivo (ej. COLOR_MARCA.naranja.botonPrimario).
// Cambiar un tono acá lo cambia en toda la app sin tocar pantallas.
//
// Reglas de uso (acordadas con el cliente):
// 1. La app usa 2 colores de marca activos: violeta claro (COLOR_MARCA.
//    violetaSuave) y naranja oscuro (COLOR_MARCA.naranja) — franjas de
//    tarjetas, botones primarios, links y acentos en general. tealAzulado,
//    verdeMenta, celeste, indigo, fucsia, rosa y purpura quedan reservados
//    para diferenciar visualmente los instrumentos clínicos entre sí
//    dentro de la Encuesta, el Informe Consolidado y —desde el rediseño
//    con pestañas del panel de indicadores del psicólogo— también en
//    dashboard_clinico/components/ResumenFormularios.jsx, donde cada
//    pestaña de instrumento usa el mismo acento que ya lo identifica en
//    el resto de la app. No se usan como acento de marca general en el
//    resto de la app. purpura se agregó en el sprint "Persona Particular"
//    para la pestaña de Riesgo Suicida — mismo criterio que los 3
//    anteriores (celeste/indigo/fucsia de SCRUM-54): tono nuevo que no
//    pisa ningún acento existente.
//    grisNeutro es distinto a los anteriores: no identifica un
//    instrumento real, es el acento reservado para pestañas/opciones
//    "placeholder" — hoy solo Bullying (visual únicamente, a pedido del
//    cliente, sin instrumento clínico detrás todavía). Se usa gris a
//    propósito para no darle una identidad de color definitiva a un
//    instrumento que todavía no existe; cuando Bullying se implemente de
//    verdad, hay que asignarle acá un tono propio (no reutilizar
//    grisNeutro) y actualizar ResumenFormularios.jsx.
// 2. Rojo y amarillo quedan reservados EXCLUSIVAMENTE para indicar
//    severidad o riesgo clínico (diagnóstico, alertas). No deben usarse
//    como acento de marca, botón genérico ni elemento puramente visual.
//    Por esto, aunque Riesgo Suicida SÍ activa una alerta real
//    (alerta_activada = true en "Riesgo Alto"), su color de PESTAÑA
//    (purpura) no puede ser rojo — la alerta ya se resalta aparte, a
//    nivel de fila, con FILA_ALERTA_ACTIVADA (ver TablaPacientes.jsx /
//    TablaPersonasParticulares.jsx).
// 3. Los tonos exactos de Tailwind (orange-700, teal-500, emerald-500,
//    violet-400) son una aproximación hecha en ausencia de códigos de
//    color exactos de la Licenciada. Si UNIFRANZ entrega una guía de
//    marca con códigos HEX, esos valores se ajustan en este único
//    archivo — no hace falta tocar ninguna pantalla.
//
// Nota: por convención del proyecto no se agregan tokens custom en
// tailwind.config.js — cada entrada de este archivo es una cadena de
// clases de Tailwind ya existentes, tal como ya lo hacía el mapa de
// diagnóstico original. Las clases se escriben siempre completas (nunca
// `bg-${color}-500`) para que el escaneo de Tailwind las detecte.
//
// Cada bloque de color sigue la misma forma (franja / tabActivo /
// tituloSeccion / botonPrimario / suave / accent) para que cualquier
// componente pueda recibir "un color" como prop sin saber cuál es —
// ver `acento` en FormularioInstrumento.jsx o InformeConsolidadoPaciente.jsx.

export const COLOR_MARCA = {
  naranja: {
    franja: 'border-orange-700',
    tabActivo: 'border-orange-700 text-orange-800',
    tituloSeccion: 'text-orange-800',
    botonPrimario: 'bg-orange-700 hover:bg-orange-800 text-white',
    suave: 'bg-orange-50 text-orange-800 border-orange-200',
    accent: 'accent-orange-700',
  },
  tealAzulado: {
    franja: 'border-teal-500',
    tabActivo: 'border-teal-500 text-teal-600',
    tituloSeccion: 'text-teal-600',
    botonPrimario: 'bg-teal-500 hover:bg-teal-600 text-white',
    suave: 'bg-teal-50 text-teal-700 border-teal-200',
    accent: 'accent-teal-500',
  },
  verdeMenta: {
    franja: 'border-emerald-500',
    tabActivo: 'border-emerald-500 text-emerald-600',
    tituloSeccion: 'text-emerald-600',
    botonPrimario: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    suave: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: 'accent-emerald-500',
  },
  violetaSuave: {
    franja: 'border-violet-400',
    tabActivo: 'border-violet-400 text-violet-600',
    tituloSeccion: 'text-violet-600',
    botonPrimario: 'bg-violet-400 hover:bg-violet-500 text-white',
    suave: 'bg-violet-50 text-violet-700 border-violet-200',
    accent: 'accent-violet-400',
  },
  // Los siguientes 3 se agregaron en SCRUM-54 para las pestañas de Estrés,
  // Ansiedad y Depresión migradas del Observatorio — mismo criterio que
  // tealAzulado/verdeMenta: solo identifican instrumentos, nunca se usan
  // como acento de marca general.
  celeste: {
    franja: 'border-sky-500',
    tabActivo: 'border-sky-500 text-sky-600',
    tituloSeccion: 'text-sky-600',
    botonPrimario: 'bg-sky-500 hover:bg-sky-600 text-white',
    suave: 'bg-sky-50 text-sky-700 border-sky-200',
    accent: 'accent-sky-500',
  },
  indigo: {
    franja: 'border-indigo-500',
    tabActivo: 'border-indigo-500 text-indigo-600',
    tituloSeccion: 'text-indigo-600',
    botonPrimario: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    suave: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accent: 'accent-indigo-500',
  },
  fucsia: {
    franja: 'border-fuchsia-500',
    tabActivo: 'border-fuchsia-500 text-fuchsia-600',
    tituloSeccion: 'text-fuchsia-600',
    botonPrimario: 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white',
    suave: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    accent: 'accent-fuchsia-500',
  },
  // Agregado para la pestaña de "Cuidado Primario De Salud Familiar"
  // (instrumento APGAR Familiar) — mismo criterio que celeste/indigo/
  // fucsia: solo identifica este instrumento, nunca se usa como acento
  // de marca general.
  rosa: {
    franja: 'border-rose-500',
    tabActivo: 'border-rose-500 text-rose-600',
    tituloSeccion: 'text-rose-600',
    botonPrimario: 'bg-rose-500 hover:bg-rose-600 text-white',
    suave: 'bg-rose-50 text-rose-700 border-rose-200',
    accent: 'accent-rose-500',
  },
  // NUEVO — sprint "Persona Particular". Identifica exclusivamente la
  // pestaña/instrumento Riesgo Suicida, en Encuesta.jsx, ResumenFormularios.jsx
  // y donde más se muestre. Ver nota de regla 2 arriba sobre por qué no
  // es rojo/amarillo pese a estar asociado a un instrumento de riesgo.
  purpura: {
    franja: 'border-purple-500',
    tabActivo: 'border-purple-500 text-purple-600',
    tituloSeccion: 'text-purple-600',
    botonPrimario: 'bg-purple-500 hover:bg-purple-600 text-white',
    suave: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: 'accent-purple-500',
  },
  // Placeholder visual para instrumentos aún no implementados (hoy:
  // Bullying) — ver nota de reglas de uso más arriba.
  grisNeutro: {
    franja: 'border-gray-400',
    tabActivo: 'border-gray-400 text-gray-600',
    tituloSeccion: 'text-gray-600',
    botonPrimario: 'bg-gray-400 hover:bg-gray-500 text-white',
    suave: 'bg-gray-100 text-gray-700 border-gray-300',
    accent: 'accent-gray-400',
  },
};

// Reservado EXCLUSIVAMENTE para severidad / alertas clínicas.
// No reutilizar rojo ni amarillo fuera de este archivo.
export const ESTILOS_DIAGNOSTICO = {
  Leve: 'bg-green-50 border-green-200 text-green-800',
  Moderado: 'bg-gray-100 border-gray-300 text-gray-800',
  Severo: 'bg-red-50 border-red-200 text-red-800',
};

// Clima de Aula calcula, del lado de la base de datos (trigger
// calcular_resultado_instrumento), 5 categorías en vez de las 3 que
// usaba el antiguo PHQ-9. Mismo criterio de color que ESTILOS_DIAGNOSTICO
// (verde = bien, gris = neutro, amarillo/rojo = atención), reservando
// amarillo y rojo para las dos categorías más bajas. Pendiente de que el
// cliente confirme si este esquema de color le sirve tal cual (ítem
// abierto documentado desde Sprint 4).
export const ESTILOS_CATEGORIA_CLIMA_AULA = {
  'Muy positivo': 'bg-green-50 border-green-200 text-green-800',
  Positivo: 'bg-green-50 border-green-200 text-green-800',
  'Medianamente favorable': 'bg-gray-100 border-gray-300 text-gray-800',
  'Poco favorable': 'bg-yellow-50 border-yellow-300 text-yellow-800',
  Negativo: 'bg-red-50 border-red-200 text-red-800',
};

// Fila resaltada en las tablas cuando el registro activó una alerta
// (ej. GSHS con alerta_activada = true por riesgo suicida, o Riesgo
// Suicida propio de Persona Particular con categoría "Riesgo Alto").
export const FILA_ALERTA_ACTIVADA =
  'bg-red-50 border-l-4 border-red-500 hover:bg-red-100';

// Colores para el gráfico de barras verticales (fill, en el <rect> del
// SVG), el anillo de la dona (stroke, en el <circle> del SVG) y la
// leyenda de la dona (bg, en el punto de color) del panel de indicadores
// del psicólogo — mismo criterio semántico que ESTILOS_CATEGORIA_CLIMA_AULA
// (verde = bien, gris = neutro, amarillo/rojo = atención). Se guardan las
// tres formas explícitas (nunca derivadas con un template string tipo
// `.replace('fill-','stroke-')`) para que el escaneo de Tailwind detecte
// las tres — ver la nota de arriba sobre clases completas.
//
// `fill` y `stroke` NO son intercambiables aunque compartan color: `fill`
// pinta el interior de una forma, `stroke` pinta su trazo/contorno. La
// dona dibuja cada categoría como un <circle> con `fill="none"` y usa
// stroke-dasharray/dashoffset para mostrar solo el arco correspondiente
// — por eso necesita `stroke`, no `fill`. Usar `fill` ahí (como se hacía
// antes) pinta el CÍRCULO COMPLETO relleno de ese color, tapando todo lo
// dibujado antes y ocultando el resto de las categorías — bug real
// encontrado y corregido en el Sprint 5 (ver GraficoDona.jsx).
export const COLOR_CATEGORIA_CLIMA_AULA = {
  'Muy positivo': { fill: 'fill-green-500', stroke: 'stroke-green-500', bg: 'bg-green-500' },
  Positivo: { fill: 'fill-green-500', stroke: 'stroke-green-500', bg: 'bg-green-500' },
  'Medianamente favorable': { fill: 'fill-gray-400', stroke: 'stroke-gray-400', bg: 'bg-gray-400' },
  'Poco favorable': { fill: 'fill-yellow-500', stroke: 'stroke-yellow-500', bg: 'bg-yellow-500' },
  Negativo: { fill: 'fill-red-500', stroke: 'stroke-red-500', bg: 'bg-red-500' },
};

// Mismo criterio para el desglose de GSHS: gris para "sin alerta"
// (neutro), rojo reservado para "con alerta activada" (severidad).
export const COLOR_ALERTA_GSHS = {
  sinAlerta: { fill: 'fill-gray-400', stroke: 'stroke-gray-400', bg: 'bg-gray-400' },
  conAlerta: { fill: 'fill-red-500', stroke: 'stroke-red-500', bg: 'bg-red-500' },
};

// Color único para las barras de "% de riesgo por módulo" del GSHS
// (SCRUM-57, dashboard_clinico/components/GraficoModulosGSHS.jsx).
// A propósito UN SOLO color parejo para los 11 módulos, sin franjas de
// severidad (rojo/amarillo/verde por rango de porcentaje): los umbrales
// de "% de riesgo alto" todavía no están validados clínicamente por la
// Licenciada (ver comentario de la tabla gshs_indicadores_riesgo en
// Supabase: "Pendiente de validación clínica formal"). Si en el futuro
// se define esa validación, este es el lugar para reemplazar el color
// único por un mapa de rangos, igual que ya existe en
// ESTILOS_CATEGORIA_CLIMA_AULA.
export const COLOR_MODULOS_GSHS = {
  fill: 'fill-emerald-500',
  stroke: 'stroke-emerald-500',
  bg: 'bg-emerald-500',
};

// Categorías de Estrés (PSS-14), Ansiedad (BAI) y Depresión (BDI-II) —
// mismo motivo que COLOR_MODULOS_GSHS: los 4 niveles que calcula el
// trigger calcular_resultado_instrumento para cada uno de estos 3
// instrumentos todavía no tienen un esquema de severidad (rojo/amarillo/
// verde) confirmado por el responsable clínico, a diferencia de Clima de
// Aula (ver ESTILOS_CATEGORIA_CLIMA_AULA/COLOR_CATEGORIA_CLIMA_AULA, que
// si lo tiene, aunque también pendiente de confirmación formal). A
// diferencia de GSHS (un solo color parejo, porque ahí todos los módulos
// pesan igual), acá sí hace falta distinguir 4 categorías ORDENADAS
// dentro del mismo gráfico — se resuelve con 4 tonos del mismo color ya
// asignado a cada instrumento en COLOR_MARCA (celeste/indigo/fucsia), de
// más claro a más oscuro según el orden de las categorías, sin tocar
// rojo/amarillo/verde en ningún punto. Si el responsable clínico
// confirma en el futuro un esquema de severidad real, este es el lugar
// para reemplazarlo, igual que ya se documenta arriba para GSHS.
export const COLOR_CATEGORIA_ESTRES = {
  'Nivel bajo': { fill: 'fill-sky-300', stroke: 'stroke-sky-300', bg: 'bg-sky-300' },
  'Nivel medio': { fill: 'fill-sky-400', stroke: 'stroke-sky-400', bg: 'bg-sky-400' },
  'Nivel alto': { fill: 'fill-sky-600', stroke: 'stroke-sky-600', bg: 'bg-sky-600' },
  'Nivel muy alto': { fill: 'fill-sky-800', stroke: 'stroke-sky-800', bg: 'bg-sky-800' },
};

export const COLOR_CATEGORIA_ANSIEDAD = {
  'No presenta ansiedad': { fill: 'fill-indigo-300', stroke: 'stroke-indigo-300', bg: 'bg-indigo-300' },
  'Ansiedad leve': { fill: 'fill-indigo-400', stroke: 'stroke-indigo-400', bg: 'bg-indigo-400' },
  'Ansiedad moderada': { fill: 'fill-indigo-600', stroke: 'stroke-indigo-600', bg: 'bg-indigo-600' },
  'Ansiedad grave': { fill: 'fill-indigo-800', stroke: 'stroke-indigo-800', bg: 'bg-indigo-800' },
};

export const COLOR_CATEGORIA_DEPRESION = {
  'Depresión mínima': { fill: 'fill-fuchsia-300', stroke: 'stroke-fuchsia-300', bg: 'bg-fuchsia-300' },
  'Depresión leve o media': { fill: 'fill-fuchsia-400', stroke: 'stroke-fuchsia-400', bg: 'bg-fuchsia-400' },
  'Depresión moderada': { fill: 'fill-fuchsia-600', stroke: 'stroke-fuchsia-600', bg: 'bg-fuchsia-600' },
  'Depresión severa': { fill: 'fill-fuchsia-800', stroke: 'stroke-fuchsia-800', bg: 'bg-fuchsia-800' },
};

// Mismos 3 textos exactos que arma el trigger calcular_resultado_
// instrumento en Supabase para tipo_instrumento = 'APGAR_FAMILIAR'
// (Cuidado Primario De Salud Familiar). Familia funcional = mejor
// resultado (claro), familia disfuncional = peor (oscuro) — mismo
// criterio de tono que el resto de los COLOR_CATEGORIA_*.
export const COLOR_CATEGORIA_APGAR_FAMILIAR = {
  'Familia funcional': { fill: 'fill-rose-300', stroke: 'stroke-rose-300', bg: 'bg-rose-300' },
  'Moderada disfunción familiar': { fill: 'fill-rose-500', stroke: 'stroke-rose-500', bg: 'bg-rose-500' },
  'Familia disfuncional': { fill: 'fill-rose-800', stroke: 'stroke-rose-800', bg: 'bg-rose-800' },
};

// NUEVO — sprint "Persona Particular". Mismos 3 textos exactos que arma
// la rama RIESGO_SUICIDA del trigger calcular_resultado_instrumento.
// Mismo criterio que COLOR_CATEGORIA_ESTRES/ANSIEDAD/DEPRESION: 3 tonos
// del color ya asignado a este instrumento (purpura), de más claro
// (mejor) a más oscuro (peor) — SIN usar rojo pese a que "Riesgo Alto"
// activa una alerta real, por la misma razón documentada en la regla 2
// de arriba. Si el responsable clínico confirma un esquema de severidad
// real para este instrumento, este es el lugar para reemplazarlo.
export const COLOR_CATEGORIA_RIESGO_SUICIDA = {
  'Riesgo Leve': { fill: 'fill-purple-300', stroke: 'stroke-purple-300', bg: 'bg-purple-300' },
  'Riesgo Moderado': { fill: 'fill-purple-500', stroke: 'stroke-purple-500', bg: 'bg-purple-500' },
  'Riesgo Alto': { fill: 'fill-purple-800', stroke: 'stroke-purple-800', bg: 'bg-purple-800' },
};