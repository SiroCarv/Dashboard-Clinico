// API pública del módulo `autenticacion`. Otros módulos (dashboard_clinico,
// instituciones, evaluaciones) solo pueden importar lo que se exporta acá
// — nunca una ruta interna como '../../autenticacion/components/BotonCerrarSesion'.
// Es la única forma permitida de consumo cruzado entre módulos.
export { default as BotonCerrarSesion } from './components/BotonCerrarSesion';
