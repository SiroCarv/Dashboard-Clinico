// Etiqueta con la institución del/la psicólogo/a, para mostrar junto al
// título "Dashboard Clínico". Solo dibuja; de dónde sale el dato lo decide
// Dashboard.jsx (hook useInstitucionPropia).
//
// Tiene 4 estados a propósito, para que "no tiene institución" nunca se
// confunda con "todavía cargando" ni con "falló la consulta":
//   - cargando: gris con spinner
//   - error: rojo, mismo estilo que el resto de avisos de error de esta
//     pantalla (no es un riesgo clínico, es un fallo de carga)
//   - con institución: fondo y borde violeta suave (el acento de esta
//     pantalla) con texto negro, a pedido de la cliente. Se escriben las
//     clases directo en vez de usar COLOR_MARCA.violetaSuave.suave porque
//     ese bloque ya trae su propio color de texto (violeta), y dos
//     clases de color de texto en el mismo elemento se resuelven por el
//     orden del CSS de Tailwind, no por el orden en que se escriben.
//   - sin institución: gris, mismo estilo de "sin dato" que ya usan
//     TablaResultadosGlobales.jsx e InformeConsolidadoPaciente.jsx
// Los nombres largos se recortan con "…" y se ven completos al pasar el
// mouse (title), para no romper el encabezado en pantallas angostas.

const CLASES_BASE =
  'inline-flex items-center max-w-full px-3 py-1 border rounded-full text-sm font-semibold';

export function BadgeInstitucion({ nombre, cargando, error }) {
  if (cargando) {
    return (
      <span className={`${CLASES_BASE} gap-2 bg-gray-100 border-gray-300 text-gray-600`}>
        <svg
          className="animate-spin h-3 w-3 text-gray-500 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Cargando institución...
      </span>
    );
  }

  if (error) {
    return <span className={`${CLASES_BASE} bg-red-50 border-red-200 text-red-800`}>{error}</span>;
  }

  if (nombre) {
    return (
      <span className={`${CLASES_BASE} gap-1 bg-violet-50 border-violet-200 text-black`} title={nombre}>
        <span className="shrink-0">Institución:</span>
        <span className="truncate font-bold">{nombre}</span>
      </span>
    );
  }

  return (
    <span className={`${CLASES_BASE} bg-gray-100 border-gray-300 text-gray-600`}>
      Sin institución asignada
    </span>
  );
}