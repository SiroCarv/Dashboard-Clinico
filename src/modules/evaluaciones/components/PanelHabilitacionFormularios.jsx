// Pestaña "Formularios" del psicólogo/a: interruptor por formulario. Al
// habilitar uno, se habilita para TODOS los estudiantes de su institución
// a la vez; al deshabilitarlo, deja de aparecerles. `totalEstudiantes` y
// `respuestasPorTipo` (cuántos ya lo respondieron) los calcula quien usa
// el panel con los datos que ya tiene cargados.
import { CATALOGO_FORMULARIOS_ESTUDIANTE } from '../../../shared/data/catalogoFormularios';
import { usePanelHabilitaciones } from '../hooks/usePanelHabilitaciones';

export default function PanelHabilitacionFormularios({ totalEstudiantes = 0, respuestasPorTipo = {} }) {
  const { institucion, estados, cargando, error, guardandoTipo, alternar } = usePanelHabilitaciones();

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-16 gap-3">
        <svg className="animate-spin h-6 w-6 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-700 font-semibold">Cargando formularios...</span>
      </div>
    );
  }

  if (!institucion) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
        <p className="font-bold">Sin institución asignada</p>
        <p className="text-sm mt-1">
          Todavía no tienes una institución asignada. Pide al administrador que te la asigne para poder
          habilitar formularios.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-extrabold text-black">Formularios para estudiantes</h3>
        <p className="text-gray-500 mt-1 font-medium text-sm">
          Al habilitar un formulario, lo verán todos los estudiantes de {institucion.nombre || 'tu institución'}.
          Mientras no habilites ninguno, sus pantallas permanecen en espera.
        </p>
      </div>

      {error && (
        <div className="m-6 mb-0 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
          {error}
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {CATALOGO_FORMULARIOS_ESTUDIANTE.map(({ tipo, etiqueta }) => {
          const habilitado = Boolean(estados[tipo]);
          const guardando = guardandoTipo === tipo;
          const respondieron = respuestasPorTipo[tipo] ?? 0;

          return (
            <li key={tipo} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="font-bold text-black">{etiqueta}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {respondieron} de {totalEstudiantes} estudiantes lo respondieron
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${habilitado ? 'text-green-600' : 'text-gray-400'}`}>
                  {habilitado ? 'Habilitado' : 'Deshabilitado'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={habilitado}
                  aria-label={`${habilitado ? 'Deshabilitar' : 'Habilitar'} ${etiqueta}`}
                  disabled={Boolean(guardandoTipo)}
                  onClick={() => alternar(tipo)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    habilitado ? 'bg-violet-400' : 'bg-gray-300'
                  } ${guardando ? 'animate-pulse' : ''}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      habilitado ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
