// Utilidades para mostrar una respuesta guardada con su pregunta real.
// `respuestas_json` solo guarda { modulo, numero, valor } por cada
// respuesta — nunca el enunciado (el cálculo del lado de la base compara
// por módulo/número/valor, no por texto de pregunta). Para mostrar la
// pregunta hay que volver a buscarla en la definición del instrumento,
// cruzando por módulo + número. Lo usan el Informe Consolidado en pantalla
// y su exportación a Excel, para que ambos muestren lo mismo.
import { INSTRUMENTOS_POR_TIPO } from '../../evaluaciones';

// Si no encuentra la pregunta (ej. el instrumento cambió de contenido
// después de que este paciente respondió), cae de vuelta a "Pregunta N"
// en lugar de romper el informe — nunca deja el valor de la respuesta
// sin una etiqueta al lado.
export function obtenerTextoPregunta(tipoInstrumento, modulo, numero) {
  const instrumento = INSTRUMENTOS_POR_TIPO[tipoInstrumento];
  const seccion = instrumento?.secciones.find((s) => s.titulo === modulo);
  const item = seccion?.items.find((i) => i.numero === numero);
  return item?.texto ?? `Pregunta ${numero}`;
}

// Verdadero/Falso se guarda como booleano (Clima de Aula en envíos
// antiguos) y las preguntas de selección múltiple (Bullying) como lista:
// ambos se convierten a texto legible.
export function formatearRespuesta(valor, separador = ', ') {
  if (typeof valor === 'boolean') return valor ? 'Verdadero' : 'Falso';
  if (Array.isArray(valor)) return valor.join(separador);
  return valor;
}
