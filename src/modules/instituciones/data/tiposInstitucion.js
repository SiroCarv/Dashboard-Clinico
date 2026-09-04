// Único lugar del código donde se define qué tipos de institución
// existen, qué prefijo de código le corresponde a cada uno, y cómo se
// muestra su etiqueta. Antes vivía duplicado dentro de
// InstitucionModal.jsx; se extrajo acá porque InstitucionList.jsx
// también lo necesita (badge + filtro por tipo) y un módulo no debe
// duplicar este tipo de catálogo en dos componentes.
//
// "institucion" (tercera categoría, genérica) se agregó para cubrir
// organizaciones que no son colegio ni centro de salud -- empresas,
// trabajo comunitario, etc. -- alineado con las áreas del Observatorio
// de Salud Mental (Salud Mental en Empresas y Organizaciones, Salud
// Mental Comunitaria) que a futuro podrían registrarse como
// instituciones propias.
export const TIPOS_INSTITUCION = [
  { value: 'unidad_educativa', label: 'Unidad Educativa', prefijo: 'UNI' },
  { value: 'centro_salud', label: 'Centro de Salud', prefijo: 'CS' },
  { value: 'institucion', label: 'Institución', prefijo: 'INST' },
];

export const TIPO_POR_DEFECTO = TIPOS_INSTITUCION[0].value;

export const obtenerPrefijo = (tipo) =>
  TIPOS_INSTITUCION.find((t) => t.value === tipo)?.prefijo || TIPOS_INSTITUCION[0].prefijo;

// Las instituciones creadas antes de que existiera esta columna no
// tienen tipo guardado (tipo_institucion en NULL); en la práctica todas
// son Unidad Educativa, así que ese es el fallback -- mismo criterio que
// ya usaba InstitucionModal.jsx al editar una institución sin tipo.
export const obtenerLabelTipo = (tipo) =>
  TIPOS_INSTITUCION.find((t) => t.value === tipo)?.label || TIPOS_INSTITUCION[0].label;