// Tabla de pasantes del panel de la Docente Supervisora: una fila por
// cuenta marcada como pasante, con sus totales de trabajo y su última nota.
// Toda la fila es clickeable y lleva al detalle (misma interacción que
// TablaPersonasParticulares: fila con role="button" y soporte de teclado).
//
// La marca "⚠️ Alerta" avisa cuántas evaluaciones con alerta clínica tiene
// el centro de la pasante; es informativa para quien supervisa, no cambia
// el orden de la tabla.
import { useNavigate } from 'react-router-dom';
import { FILA_ALERTA_ACTIVADA } from '../../../shared/theme/paletaColores';
import { ETIQUETA_TURNO_PSICOLOGO } from '../../psicologos';
import { formatearFecha } from '../utils/formatoFecha';

export function TablaPasantes({ pasantes, hayFiltrosActivos = false }) {
  const navigate = useNavigate();

  const irAlDetalle = (id) => navigate(`/supervision-pasantias/pasante/${encodeURIComponent(id)}`);

  if (pasantes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">
          {hayFiltrosActivos
            ? 'No se encontraron pasantes con estos criterios.'
            : 'Aún no hay pasantes asignadas a tu supervisión. El administrador de la plataforma debe marcarlas.'}
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
              <th className="p-4 font-bold border-b border-gray-200">Pasante</th>
              <th className="p-4 font-bold border-b border-gray-200">Institución</th>
              <th className="p-4 font-bold border-b border-gray-200 text-center">Personas</th>
              <th className="p-4 font-bold border-b border-gray-200 text-center">Evaluaciones</th>
              <th className="p-4 font-bold border-b border-gray-200">Última evaluación</th>
              <th className="p-4 font-bold border-b border-gray-200 text-center">Última nota</th>
              <th className="p-4 font-bold border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pasantes.map((pasante) => (
              <tr
                key={pasante.id}
                onClick={() => irAlDetalle(pasante.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    irAlDetalle(pasante.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`cursor-pointer transition-colors ${
                  pasante.evaluacionesConAlerta > 0 ? FILA_ALERTA_ACTIVADA : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-4 text-gray-800 font-medium">
                  <span className="align-middle">{pasante.nombre || 'Sin nombre registrado'}</span>
                  {pasante.evaluacionesConAlerta > 0 && (
                    <span className="inline-block ml-2 px-2 py-0.5 bg-red-100 border border-red-300 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide align-middle">
                      ⚠️ {pasante.evaluacionesConAlerta} {pasante.evaluacionesConAlerta === 1 ? 'alerta' : 'alertas'}
                    </span>
                  )}
                  <div className="text-xs text-gray-500 font-normal">
                    {ETIQUETA_TURNO_PSICOLOGO[pasante.turno] || pasante.email || ''}
                  </div>
                </td>
                <td className="p-4 text-gray-600">
                  {pasante.instituciones || <span className="text-gray-400 italic">Sin institución</span>}
                </td>
                <td className="p-4 text-gray-800 text-center">{pasante.totalPersonas}</td>
                <td className="p-4 text-gray-800 text-center">{pasante.totalEvaluaciones}</td>
                <td className="p-4 text-gray-600">{formatearFecha(pasante.ultimaEvaluacion)}</td>
                <td className="p-4 text-center">
                  {pasante.ultimaNota === null || pasante.ultimaNota === undefined ? (
                    <span className="text-gray-400 italic text-sm">Sin calificar</span>
                  ) : (
                    <span className="font-bold text-gray-800">{pasante.ultimaNota}</span>
                  )}
                </td>
                <td className="p-4 text-right text-violet-400 font-bold text-sm whitespace-nowrap">
                  Ver detalle →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
