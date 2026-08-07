// Borrador local de un instrumento en curso: guarda las respuestas que el
// paciente ya marcó, para no perderlas si cierra la pestaña por
// accidente antes de enviar. La clave incluye el id del paciente (no
// solo el tipo de instrumento) para que dos personas que compartan el
// mismo navegador/dispositivo nunca vean el borrador de la otra.
//
// Usa la convención de shared/utils/borradorLocal.js a propósito: eso es
// lo que le permite a useCerrarSesion.js (dominio autenticacion) saber
// qué NO debe borrar al cerrar sesión, sin que ese módulo importe nada
// de acá directamente.
import { claveBorrador } from '../../../shared/utils/borradorLocal';

function clave(idPaciente, tipoInstrumento) {
  return claveBorrador('encuesta', idPaciente, tipoInstrumento);
}

export function leerBorrador(idPaciente, tipoInstrumento) {
  try {
    const crudo = localStorage.getItem(clave(idPaciente, tipoInstrumento));
    return crudo ? JSON.parse(crudo) : null;
  } catch (err) {
    console.error('No se pudo leer el borrador guardado:', err.message);
    return null;
  }
}

export function guardarBorrador(idPaciente, tipoInstrumento, respuestas) {
  try {
    localStorage.setItem(clave(idPaciente, tipoInstrumento), JSON.stringify(respuestas));
  } catch (err) {
    console.error('No se pudo guardar el borrador:', err.message);
  }
}

export function borrarBorrador(idPaciente, tipoInstrumento) {
  localStorage.removeItem(clave(idPaciente, tipoInstrumento));
}