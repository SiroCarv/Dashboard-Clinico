// Página de detalle de UNA Persona Particular (historia "Vista de
// informe individual de Persona Particular"), a la que se llega al
// hacer clic en una fila de TablaPersonasParticulares.jsx. Mismo patrón
// de página que InformeConsolidado.jsx (BarraSuperior, link de "Volver",
// estados de carga/error/"sin acceso"), pero mucho más simple: no hay
// pestañas por instrumento ni exportación a Excel — ninguna historia de
// este sprint las pidió para este perfil, y agregar exportación acá
// reutilizando exportarInformePacienteExcel.js mostraría columnas que no
// le corresponden a Persona Particular (curso/paralelo/turno).
//
// "No se encontró esta persona, o no tienes acceso a su información":
// mismo mensaje único que ya usa InformeConsolidado.jsx para "no existe"
// y "existe pero la RLS lo deniega en silencio" — no se distinguen a
// propósito, mismo motivo (no revelarle a un psicólogo si un ID ajeno
// existe o no).
import { useParams, Link } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { useInformePersonaParticular } from '../hooks/useInformePersonaParticular';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

// Mismos textos de etiqueta que ya usan Encuesta.jsx/ResumenFormularios.jsx
// para cada tipo_instrumento — se repite acá (no hay un único catálogo
// compartido de "nombre visible por tipo_instrumento" en todo el
// proyecto todavía) en vez de importarlo del módulo `evaluaciones`, que
// un módulo no puede hacer.
const ETIQUETA_INSTRUMENTO = {
  ESTRES: 'Estrés',
  ANSIEDAD: 'Ansiedad',
  DEPRESION: 'Depresión',
  APGAR_FAMILIAR: 'Cuidado Primario De Salud Familiar',
  RIESGO_SUICIDA: 'Riesgo Suicida',
};

function Campo({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{etiqueta}</p>
      <p className="text-gray-800 font-medium">{valor ?? '—'}</p>
    </div>
  );
}

export default function InformePersonaParticular() {
  const { idPersona } = useParams();
  const { persona, ultimaEvaluacion, loading, error } = useInformePersonaParticular(idPersona);

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Panel de Administración (Psicólogo/a)" />

      <div className="relative z-10 p-6 md:p-10 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="mb-3">
            <Link to="/dashboard" className="text-gray-500 hover:text-orange-700 font-bold transition-colors">
              ← Volver al Dashboard
            </Link>
          </div>

          <h2 className="text-2xl font-extrabold text-black">Informe — Persona Particular</h2>
          <p className="text-gray-700 mt-1 font-semibold">Datos de registro y última evaluación de esta persona.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 font-semibold">Cargando informe...</span>
          </div>
        ) : !persona ? (
          <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500 font-medium">
            No se encontró esta persona, o no tienes acceso a su información.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
              <h3 className="text-lg font-extrabold text-black mb-4">{persona.nombre || 'Sin nombre registrado'}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Campo etiqueta="Carnet de Identidad" valor={persona.carnet_identidad} />
                <Campo etiqueta="Edad" valor={persona.edad} />
                <Campo etiqueta="Sexo" valor={persona.sexo} />
                <Campo etiqueta="Estado civil" valor={persona.estado_civil} />
                <Campo etiqueta="Teléfono" valor={persona.telefono} />
                <Campo etiqueta="Grado de instrucción" valor={persona.grado_instruccion} />
                <Campo etiqueta="Número de hijos" valor={persona.numero_hijos} />
                <Campo
                  etiqueta="Tipo de trabajo"
                  valor={persona.tipo_trabajo === 'particular' ? 'Particular' : persona.tipo_trabajo === 'dependiente' ? 'Dependiente' : null}
                />
                <Campo etiqueta="Centro de Salud" valor={persona.institucion?.nombre} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
              <h3 className="text-lg font-extrabold text-black mb-4">Última evaluación</h3>
              {!ultimaEvaluacion ? (
                <p className="text-gray-500 font-medium">Esta persona aún no tiene evaluaciones registradas.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-bold text-sm">
                    {ETIQUETA_INSTRUMENTO[ultimaEvaluacion.tipo_instrumento] || ultimaEvaluacion.tipo_instrumento}
                  </span>
                  {ultimaEvaluacion.resultado_json?.categoria && (
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-300 font-bold text-sm">
                      {ultimaEvaluacion.resultado_json.categoria}
                    </span>
                  )}
                  {ultimaEvaluacion.alerta_activada && (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-sm">
                      ⚠️ Alerta
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(ultimaEvaluacion.fecha_registro).toLocaleDateString('es-BO')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}