// Tabla del Dashboard: una fila por paciente (Participante o
// Consultante), con su institución y un link al Informe Consolidado. La
// fila entera es clickeable (rol="button" + onKeyDown) para navegar,
// no solo el texto "Ver informe →".
import { useNavigate } from 'react-router-dom';
import {
  obtenerEtiquetaIdentidad,
  obtenerNombreMostrado,
  obtenerEstiloEtiquetaIdentidad,
} from '../../../shared/utils/identidadUsuario';

export function TablaPacientes({ pacientes, hayFiltrosActivos = false }) {
  const navigate = useNavigate();

  const irAInforme = (id) => navigate(`/dashboard/informe/${id}`);

  if (pacientes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">
          {hayFiltrosActivos
            ? 'No se encontraron participantes ni consultantes con estos criterios.'
            : 'No hay participantes ni consultantes registrados aún.'}
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
              <th className="p-4 font-bold border-b border-gray-200">Participante / Consultante</th>
              <th className="p-4 font-bold border-b border-gray-200">Institución</th>
              <th className="p-4 font-bold border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pacientes.map((persona) => {
              const etiquetaIdentidad = obtenerEtiquetaIdentidad(persona);

              return (
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
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="p-4 text-gray-800 font-medium">
                    <span
                      className={`inline-block px-2 py-0.5 mr-2 border rounded-full text-xs font-semibold align-middle ${obtenerEstiloEtiquetaIdentidad(
                        etiquetaIdentidad
                      )}`}
                    >
                      {etiquetaIdentidad}
                    </span>
                    <span className="align-middle">{obtenerNombreMostrado(persona)}</span>
                  </td>
                  <td className="p-4 text-gray-600">{persona.institucion?.nombre || '—'}</td>
                  <td className="p-4 text-right text-violet-400 font-bold text-sm">Ver informe →</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
