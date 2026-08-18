// Paleta de colores institucional (UNIFRANZ) — referencia única y
// centralizada para toda la plataforma. Ningún componente escribe un
// color de marca directo (ej. "bg-orange-700"); siempre importa un
// bloque de este archivo (ej. COLOR_MARCA.naranja.botonPrimario).
// Cambiar un tono acá lo cambia en toda la app sin tocar pantallas.
//
// Reglas de uso (acordadas con el cliente):
// 1. La app usa 2 colores de marca activos: violeta claro (COLOR_MARCA.
//    violetaSuave) y naranja oscuro (COLOR_MARCA.naranja) — franjas de
//    tarjetas, botones primarios, links y acentos en general. tealAzulado
//    y verdeMenta quedan reservados para diferenciar visualmente los
//    instrumentos clínicos entre sí (Clima de Aula / GSHS) dentro de la
//    Encuesta y el Informe Consolidado — no se usan como acento de marca
//    general en el resto de la app.
// 2. Rojo y amarillo quedan reservados EXCLUSIVAMENTE para indicar
//    severidad o riesgo clínico (diagnóstico, alertas). No deben usarse
//    como acento de marca, botón genérico ni elemento puramente visual.
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
// (ej. GSHS con alerta_activada = true por riesgo suicida).
export const FILA_ALERTA_ACTIVADA =
  'bg-red-50 border-l-4 border-red-500 hover:bg-red-100';

// Relleno de barra (tono sólido 500, no el 50 pastel de arriba) para el
// gráfico de Clima de Aula del panel de indicadores del psicólogo —
// mismo criterio semántico que ESTILOS_CATEGORIA_CLIMA_AULA (verde =
// bien, gris = neutro, amarillo/rojo = atención), pero un pastel bg-*-50
// prácticamente no se ve como barra rellena.
export const RELLENO_CATEGORIA_CLIMA_AULA = {
  'Muy positivo': 'bg-green-500',
  Positivo: 'bg-green-500',
  'Medianamente favorable': 'bg-gray-400',
  'Poco favorable': 'bg-yellow-500',
  Negativo: 'bg-red-500',
};

// Mismo gráfico de barras, para el desglose de GSHS entre quienes
// completaron el instrumento: gris para "sin alerta" (neutro), rojo
// reservado para "con alerta activada" (severidad).
export const RELLENO_ALERTA_GSHS = {
  sinAlerta: 'bg-gray-400',
  conAlerta: 'bg-red-500',
};