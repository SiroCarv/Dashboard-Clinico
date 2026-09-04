// Formulario de un solo paso para que el docente registre un reporte de
// seguimiento sobre un alumno -- reemplaza al flujo de selección de
// alumno + instrumentos completos de SCRUM-51. Es un componente "tonto"
// (recibe valores y handlers por props, no llama a Supabase él mismo),
// mismo criterio que ya usaban SelectorAlumno.jsx/SelectorPsicologo.jsx.
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { OPCIONES_CURSO, OPCIONES_PARALELO, OPCIONES_TURNO } from '../data/opcionesReporte';

export default function FormularioReporteDocente({ valores, onCambiar, onEnviar, enviando, error }) {
  const { nombreAlumno, apellidoAlumno, curso, paralelo, turno, descripcion } = valores;

  const formCompleto =
    nombreAlumno.trim() && apellidoAlumno.trim() && curso && paralelo && turno && descripcion.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formCompleto || enviando) return;
    onEnviar();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-lg shadow-xl border-t-8 ${COLOR_MARCA.violetaSuave.franja} p-6 space-y-5`}
    >
      <div>
        <h3 className="text-lg font-extrabold text-black mb-1">Registrar un nuevo reporte</h3>
        <p className="text-gray-500 text-sm">
          Cuéntanos sobre un alumno que te preocupe. El psicólogo de tu institución lo revisará.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-black mb-1">Nombre del alumno</label>
          <input
            type="text"
            value={nombreAlumno}
            onChange={(e) => onCambiar('nombreAlumno', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-black mb-1">Apellido del alumno</label>
          <input
            type="text"
            value={apellidoAlumno}
            onChange={(e) => onCambiar('apellidoAlumno', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-black mb-1">Curso</label>
          <select
            value={curso}
            onChange={(e) => onCambiar('curso', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          >
            <option value="">Selecciona...</option>
            {OPCIONES_CURSO.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-black mb-1">Paralelo</label>
          <select
            value={paralelo}
            onChange={(e) => onCambiar('paralelo', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          >
            <option value="">Selecciona...</option>
            {OPCIONES_PARALELO.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-black mb-1">Turno</label>
          <select
            value={turno}
            onChange={(e) => onCambiar('turno', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          >
            <option value="">Selecciona...</option>
            {OPCIONES_TURNO.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-1">Describe el caso o problema</label>
        <textarea
          value={descripcion}
          onChange={(e) => onCambiar('descripcion', e.target.value)}
          required
          rows={6}
          placeholder="Bajas notas, tristeza, cambios de comportamiento, etc. Sé lo más detallado posible."
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!formCompleto || enviando}
          className={`px-6 py-2.5 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors flex items-center gap-2 ${
            !formCompleto || enviando ? 'bg-gray-400 cursor-not-allowed text-white' : COLOR_MARCA.violetaSuave.botonPrimario
          }`}
        >
          {enviando ? (
            <>
              <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Enviando...
            </>
          ) : (
            'Enviar reporte'
          )}
        </button>
      </div>
    </form>
  );
}