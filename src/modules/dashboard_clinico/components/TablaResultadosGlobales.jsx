// Tabla del Panel Consolidado del superadministrador (SCRUM-56): una
// fila por resultado de evaluación, con paciente, institución,
// psicólogo asignado, instrumento y un resumen del resultado.
//
// SCRUM-60 — Detalle de casos registrados por docente: se agrega la
// columna "Registrado por", que distingue el autoenvío del propio
// estudiante de un caso que un docente registró en su nombre (mismo
// dato que ya usa Dashboard.jsx para su filtro "Estudiante/Docente" de
// SCRUM-53, acá mostrado en vez de solo filtrado). Cuando fue un
// docente, se muestra su nombre — la Licenciada pidió ver esto
// "detalladamente", no solo como una bandera sí/no.
//
// A diferencia de TablaPacientes.jsx (una fila por persona), acá cada
// fila es un resultado puntual — el criterio de aceptación pide
// identificar institución y psicólogo "por cada resultado", no por
// paciente. Por eso no es clickeable ni lleva a un informe: no hay
// historia de "detalle de un resultado" en el alcance de SCRUM-56.
//
// GSHS — DECISIÓN DEL CLIENTE (actualizada en SCRUM-57): en ESTA tabla
// (fila por resultado individual) nunca se lee ni se muestra
// `resultado_json` para este instrumento — son indicadores de
// prevalencia por módulo de un estudiante puntual, y la Licenciada solo
// autorizó mostrarlos agregados entre muchos estudiantes, nunca fila por
// fila. Acá se sigue usando solo `alerta_activada`, igual que en
// InformeConsolidadoPaciente.jsx. El porcentaje agregado por módulo vive
// en su propia sección (dashboard_clinico/pages/IndicadoresGSHS.jsx /
// IndicadoresGSHSSuperadmin.jsx), no en esta tabla.
//
// Las filas con `alerta_activada = true` se resaltan con
// FILA_ALERTA_ACTIVADA (rojo, reservado exclusivamente para severidad
// clínica), mismo criterio que TablaPacientes.jsx.
import {
  COLOR_MARCA,
  ESTILOS_CATEGORIA_CLIMA_AULA,
  FILA_ALERTA_ACTIVADA,
} from '../../../shared/theme/paletaColores';
import {
  obtenerEtiquetaIdentidad,
  obtenerNombreMostrado,
  obtenerEstiloEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

const ETIQUETA_INSTRUMENTO = {
  CLIMA_AULA: 'Clima de Aula',
  GSHS: 'GSHS',
  ESTRES: 'Estrés (PSS-14)',
  ANSIEDAD: 'Ansiedad (BAI)',
  DEPRESION: 'Depresión (BDI-II)',
};

// Mismo criterio de color que InformeConsolidadoPaciente.jsx: cada
// instrumento se identifica con uno de los 5 acentos reservados para
// esto en paletaColores.js (nunca naranja/violeta, que son el acento de
// marca general de esta pantalla, y nunca rojo/amarillo, reservados a
// severidad clínica).
const ACENTO_INSTRUMENTO = {
  CLIMA_AULA: COLOR_MARCA.tealAzulado,
  GSHS: COLOR_MARCA.verdeMenta,
  ESTRES: COLOR_MARCA.celeste,
  ANSIEDAD: COLOR_MARCA.indigo,
  DEPRESION: COLOR_MARCA.fucsia,
};

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Resumen visible del resultado: puntaje + categoría para los 4
// instrumentos que sí lo calculan (ver trigger
// calcular_resultado_instrumento en la base real), o solo el estado de
// la alerta para GSHS, que nunca expone su `resultado_json` (ver nota
// de archivo). Las categorías de Estrés/Ansiedad/Depresión todavía no
// tienen un esquema de color propio confirmado por el responsable
// clínico (a diferencia de Clima de Aula, que sí lo tiene en
// ESTILOS_CATEGORIA_CLIMA_AULA) — se muestran en un badge neutro a
// propósito, en vez de inventar un mapeo de severidad no validado. La
// señal de severidad real de cada fila sigue siendo `alerta_activada`
// (resalta la fila entera), no el color de este badge.
function ResumenResultado({ resultado }) {
  if (resultado.tipo_instrumento === 'GSHS') {
    return resultado.alerta_activada ? (
      <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide">
        ⚠️ Alerta activada
      </span>
    ) : (
      <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-semibold">
        Sin alertas puntuales
      </span>
    );
  }

  if (!resultado.resultado_json) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  const { puntaje_total: puntaje, categoria } = resultado.resultado_json;
  const estilo =
    resultado.tipo_instrumento === 'CLIMA_AULA'
      ? (ESTILOS_CATEGORIA_CLIMA_AULA[categoria] ?? 'bg-gray-100 border-gray-300 text-gray-800')
      : 'bg-gray-100 border-gray-300 text-gray-800';

  return (
    <span className={`px-3 py-1 border rounded-full text-sm font-semibold ${estilo}`}>
      {puntaje} — {categoria}
    </span>
  );
}

// Badge de origen del registro (SCRUM-60). Gris neutro para el
// autoenvío (es el caso por defecto, no necesita destacarse) y
// violetaSuave — uno de los 2 acentos de marca general de la app, no
// uno de los reservados a instrumentos clínicos — para el caso
// registrado por un docente, ya que es la excepción que la Licenciada
// pidió poder distinguir de un vistazo.
function OrigenRegistro({ resultado }) {
  if (!resultado.registrado_por_docente_id) {
    return (
      <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-semibold">
        Autoenvío
      </span>
    );
  }

  return (
    <span
      className={`px-2.5 py-1 border rounded-full text-xs font-semibold ${COLOR_MARCA.violetaSuave.suave}`}
    >
      Docente: {resultado.docente?.nombre || 'nombre no disponible'}
    </span>
  );
}

export function TablaResultadosGlobales({ resultados, hayFiltrosActivos = false }) {
  if (resultados.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">
          {hayFiltrosActivos
            ? 'No se encontraron resultados con estos criterios.'
            : 'Todavía no hay resultados de evaluaciones registrados.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-gray-200">Fecha</th>
              <th className="p-4 font-bold border-b border-gray-200">Participante / Consultante</th>
              <th className="p-4 font-bold border-b border-gray-200">Institución</th>
              <th className="p-4 font-bold border-b border-gray-200">Psicólogo asignado</th>
              <th className="p-4 font-bold border-b border-gray-200">Registrado por</th>
              <th className="p-4 font-bold border-b border-gray-200">Instrumento</th>
              <th className="p-4 font-bold border-b border-gray-200">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resultados.map((resultado) => {
              const paciente = resultado.paciente;
              const etiquetaIdentidad = obtenerEtiquetaIdentidad(paciente);
              const acento = ACENTO_INSTRUMENTO[resultado.tipo_instrumento] ?? COLOR_MARCA.violetaSuave;

              return (
                <tr
                  key={resultado.id_evaluacion}
                  className={`transition-colors ${
                    resultado.alerta_activada ? FILA_ALERTA_ACTIVADA : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-4 text-gray-600 text-sm whitespace-nowrap">
                    {formatearFecha(resultado.fecha_registro)}
                  </td>
                  <td className="p-4 text-gray-800 font-medium">
                    <span
                      className={`inline-block px-2 py-0.5 mr-2 border rounded-full text-xs font-semibold align-middle ${obtenerEstiloEtiquetaIdentidad(
                        etiquetaIdentidad
                      )}`}
                    >
                      {etiquetaIdentidad}
                    </span>
                    <span className="align-middle">{obtenerNombreMostrado(paciente)}</span>
                  </td>
                  <td className="p-4 text-gray-600">{paciente?.institucion?.nombre || '—'}</td>
                  <td className="p-4 text-gray-600">{paciente?.psicologo_asignado?.nombre || '—'}</td>
                  <td className="p-4">
                    <OrigenRegistro resultado={resultado} />
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 border rounded-full text-xs font-semibold ${acento.suave}`}>
                      {ETIQUETA_INSTRUMENTO[resultado.tipo_instrumento] ?? resultado.tipo_instrumento}
                    </span>
                  </td>
                  <td className="p-4">
                    <ResumenResultado resultado={resultado} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}