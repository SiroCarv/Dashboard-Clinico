// Nombre visible de cada tipo de formulario (`tipo_instrumento`) y del tipo
// de persona atendida (`usuarios.rol`), para las tablas de este módulo.
//
// Los formularios salen del catálogo compartido (`shared/data/
// catalogoFormularios.js`) en vez de repetir los 8 nombres acá; ese
// catálogo se llama "de estudiante" pero lista todos los tipos que existen
// en la base, incluidos los de Persona Particular.
import { CATALOGO_FORMULARIOS_ESTUDIANTE } from '../../../shared/data/catalogoFormularios';

export const ETIQUETA_INSTRUMENTO = Object.fromEntries(
  CATALOGO_FORMULARIOS_ESTUDIANTE.map((f) => [f.tipo, f.etiqueta])
);

// Solo estos dos roles pueden ser "persona atendida" (lo garantizan las
// consultas SQL de la supervisora).
export const ETIQUETA_TIPO_PERSONA = {
  paciente: 'Estudiante',
  persona_particular: 'Persona Particular',
};
