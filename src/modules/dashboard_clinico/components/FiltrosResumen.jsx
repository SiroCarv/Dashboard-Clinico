// Controles de filtro del panel de indicadores (historia "Filtros de
// conteo por perfil"). Todos son selects/inputs controlados por el
// estado que expone useResumenFormularios — este componente no calcula
// nada, solo refleja `filtros` y dispara `actualizarFiltro`.
const ESTILO_CAMPO =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800 text-sm';
const ESTILO_LABEL = 'block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide';

function Campo({ etiqueta, children }) {
  return (
    <div>
      <label className={ESTILO_LABEL}>{etiqueta}</label>
      {children}
    </div>
  );
}

export function FiltrosResumen({
  filtros,
  actualizarFiltro,
  limpiarFiltros,
  hayFiltrosActivos,
  generos,
  cursos,
  paralelos,
  turnos,
  tramosEdad,
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Campo etiqueta="Sexo">
          <select
            value={filtros.sexo}
            onChange={(e) => actualizarFiltro('sexo', e.target.value)}
            className={ESTILO_CAMPO}
            disabled={generos.length === 0}
          >
            <option value="todos">Todos</option>
            {generos.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Edad">
          <select
            value={filtros.tramoEdad}
            onChange={(e) => actualizarFiltro('tramoEdad', e.target.value)}
            className={ESTILO_CAMPO}
          >
            <option value="todos">Todas</option>
            {tramosEdad.map((etiqueta) => (
              <option key={etiqueta} value={etiqueta}>
                {etiqueta}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Curso">
          <select
            value={filtros.curso}
            onChange={(e) => actualizarFiltro('curso', e.target.value)}
            className={ESTILO_CAMPO}
            disabled={cursos.length === 0}
          >
            <option value="todos">Todos</option>
            {cursos.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Paralelo">
          <select
            value={filtros.paralelo}
            onChange={(e) => actualizarFiltro('paralelo', e.target.value)}
            className={ESTILO_CAMPO}
            disabled={paralelos.length === 0}
          >
            <option value="todos">Todos</option>
            {paralelos.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Turno">
          <select
            value={filtros.turno}
            onChange={(e) => actualizarFiltro('turno', e.target.value)}
            className={ESTILO_CAMPO}
            disabled={turnos.length === 0}
          >
            <option value="todos">Todos</option>
            {turnos.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Formulario">
          <select
            value={filtros.instrumento}
            onChange={(e) => actualizarFiltro('instrumento', e.target.value)}
            className={ESTILO_CAMPO}
          >
            <option value="todos">Todos</option>
            <option value="CLIMA_AULA">Clima de Aula</option>
            <option value="GSHS">GSHS</option>
            <option value="ESTRES">Estrés</option>
            <option value="ANSIEDAD">Ansiedad</option>
            <option value="DEPRESION">Depresión</option>
            {/* Placeholder visual a pedido del cliente: no hay instrumento
                real detrás todavía, así que elegir esta opción siempre
                filtra a "nadie" (ningún estudiante tiene esta evaluación) —
                comportamiento esperado, no un bug. */}
            <option value="BULLYING">Bullying</option>
          </select>
        </Campo>

        <Campo etiqueta="Enviado desde">
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) => actualizarFiltro('fechaDesde', e.target.value)}
            className={ESTILO_CAMPO}
          />
        </Campo>

        <Campo etiqueta="Enviado hasta">
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) => actualizarFiltro('fechaHasta', e.target.value)}
            className={ESTILO_CAMPO}
          />
        </Campo>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={limpiarFiltros}
          disabled={!hayFiltrosActivos}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md font-semibold text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}