// Paleta de colores institucional (UNIFRANZ) — referencia única y
// centralizada para toda la plataforma.
//
// Historia "Paleta de colores institucional". Reemplaza a las
// definiciones sueltas que antes vivían duplicadas en
// TablaHistorialEvaluaciones.jsx y DetalleClinico.jsx.
//
// Reglas de uso (acordadas con el cliente):
// 1. Los 4 colores de marca (naranja, verde azulado, verde menta y
//    violeta suave) son los únicos colores "decorativos" o de identidad
//    permitidos en el resto de la plataforma.
// 2. Rojo y amarillo quedan reservados EXCLUSIVAMENTE para indicar
//    severidad o riesgo clínico (diagnóstico, alertas). No deben usarse
//    como acento de marca, botón genérico ni elemento puramente visual.
// 3. Los tonos exactos de Tailwind (teal-500, emerald-500, violet-400)
//    son una aproximación a "verde azulado / verde menta / violeta
//    suave" hecha en ausencia de códigos de color exactos de la
//    Licenciada. Si UNIFRANZ entrega una guía de marca con códigos HEX,
//    esos 3 valores se ajustan en este único archivo — no hace falta
//    tocar ninguna pantalla.
//
// Nota: por convención del proyecto no se agregan tokens custom en
// tailwind.config.js — cada entrada de este archivo es una cadena de
// clases de Tailwind ya existentes, tal como ya lo hacía el mapa de
// diagnóstico original. Las clases se escriben siempre completas (nunca
// `bg-${color}-500`) para que el escaneo de Tailwind las detecte.

export const COLOR_MARCA = {
  naranja: {
    franja: 'border-violet-400',
    tabActivo: 'border-violet-400 text-orange-800',
    tituloSeccion: 'text-orange-800',
    botonPrimario: 'bg-violet-400 hover:bg-orange-800 text-white',
    suave: 'bg-orange-50 text-violet-400 border-orange-200',
  },
  tealAzulado: {
    franja: 'border-teal-500',
    tabActivo: 'border-teal-500 text-teal-600',
    tituloSeccion: 'text-teal-600',
    botonPrimario: 'bg-teal-500 hover:bg-teal-600 text-white',
    suave: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  verdeMenta: {
    franja: 'border-emerald-500',
    tabActivo: 'border-emerald-500 text-emerald-600',
    tituloSeccion: 'text-emerald-600',
    botonPrimario: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    suave: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  violetaSuave: {
    franja: 'border-violet-400',
    tabActivo: 'border-violet-400 text-violet-600',
    tituloSeccion: 'text-violet-600',
    botonPrimario: 'bg-violet-400 hover:bg-violet-500 text-white',
    suave: 'bg-violet-50 text-violet-700 border-violet-200',
  },
};

// Reservado EXCLUSIVAMENTE para severidad / alertas clínicas.
// No reutilizar rojo ni amarillo fuera de este archivo.
export const ESTILOS_DIAGNOSTICO = {
  Leve: 'bg-green-50 border-green-200 text-green-800',
  Moderado: 'bg-gray-100 border-gray-300 text-gray-800',
  Severo: 'bg-red-50 border-red-200 text-red-800',
};

// Fila resaltada en las tablas cuando el registro activó una alerta.
export const FILA_ALERTA_ACTIVADA =
  'bg-red-50 border-l-4 border-red-500 hover:bg-red-100';

// Pendiente (ítem abierto con el cliente, Sprint 4): Clima de Aula usa 5
// niveles de severidad y GSHS dispara alertas puntuales por pregunta.
// Cuando el cliente confirme ese esquema, sus colores se agregan acá
// —nunca sueltos en un componente— y seguirán usando exclusivamente
// rojo/amarillo/verde, nunca los 4 colores de marca de arriba.