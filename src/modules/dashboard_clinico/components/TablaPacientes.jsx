// Tabla del Dashboard: una fila por estudiante, con su institución y un
// link al Informe Consolidado. La fila entera es clickeable (rol="button"
// + onKeyDown) para navegar, no solo el texto "Ver informe →".
//
// La etiqueta junto al nombre (Estudiante/Docente) es `tipoPersona`
// (SCRUM-53: quién originó el registro, no el rol de la cuenta — todas
// las filas de esta tabla son cuentas de rol "estudiante", ver
// pacientesService.js). Reemplaza la vieja etiqueta Participante/
// Consultante (retirada, ver shared/utils/identidadUsuario.js): esa
// distinguía si tenía institución, algo que ya no puede pasar con datos
// nuevos desde que se retiró el registro particular (SCRUM-46/47/48).
// Si `tipoPersona` es `null` (todavía no completó ningún formulario), no
// se muestra ninguna etiqueta — no hay nada que distinguir aún.
//
// Las filas con tieneAlertaActiva=true (alguna evaluación con
// alerta_activada, ej. riesgo suicida en el módulo de Salud Mental del
// GSHS) se resaltan con FILA_ALERTA_ACTIVADA (rojo, reservado
// exclusivamente para severidad clínica — ver paletaColores.js) y llevan
// una insignia "⚠️ Alerta" junto al nombre, para que el psicólogo la note
// de un vistazo sin tener que abrir el informe de cada paciente.
import { useNavigate } from 'react-router-dom';
import { obtenerNombreMostrado } from '../../../shared/utils/identidadUsuario';
import { ETIQUETA_TIPO_PERSONA, obtenerEstiloTipoPersona } from '../utils/etiquetaTipoPersona';
import { FILA_ALERTA_ACTIVADA } from '../../../shared/theme/paletaColores';

export function TablaPacientes({ pacientes, hayFiltrosActivos = false }) {
  const navigate = useNavigate();

  const irAInforme = (id) => navigate(`/dashboard/informe/${id}`);

  if (pacientes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">
          {hayFiltrosActivos
            ? 'No se encontraron estudiantes con estos criterios.'
            : 'No hay estudiantes registrados aún.'}
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
              <th className="p-4 font-bold border-b border-gray-200">Estudiante</th>
              <th className="p-4 font-bold border-b border-gray-200">Institución</th>
              <th className="p-4 font-bold border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pacientes.map((persona) => (
              <tr
                key={persona.id}
                onClick={() => irAInforme(persona.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    irAInforme(persona.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`cursor-pointer transition-colors ${
                  persona.tieneAlertaActiva ? FILA_ALERTA_ACTIVADA : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-4 text-gray-800 font-medium">
                  {persona.tipoPersona && (
                    <span
                      className={`inline-block px-2 py-0.5 mr-2 border rounded-full text-xs font-semibold align-middle ${obtenerEstiloTipoPersona(
                        persona.tipoPersona
                      )}`}
                    >
                      {ETIQUETA_TIPO_PERSONA[persona.tipoPersona]}
                    </span>
                  )}
                  <span className="align-middle">{obtenerNombreMostrado(persona)}</span>
                  {persona.tieneAlertaActiva && (
                    <span className="inline-block ml-2 px-2 py-0.5 bg-red-100 border border-red-300 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide align-middle">
                      ⚠️ Alerta
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{persona.institucion?.nombre || '—'}</td>
                <td className="p-4 text-right text-violet-400 font-bold text-sm">Ver informe →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
