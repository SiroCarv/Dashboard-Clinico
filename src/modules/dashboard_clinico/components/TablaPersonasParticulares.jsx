// Tabla de Personas Particulares en el Dashboard — misma estructura
// visual que TablaPacientes.jsx (fila clickeable, alerta resaltada en
// rojo), pero con su propio link de informe (/dashboard/informe-particular/:id
// en vez de /dashboard/informe/:id) y sin columna "Institución" con ese
// nombre — acá se llama "Centro de Salud" para hablar el mismo idioma
// que el resto de las pantallas de Persona Particular. Se separó de
// TablaPacientes.jsx en vez de agregarle un prop condicional: son
// columnas y un destino de navegación distintos, no una variación menor
// del mismo componente.
import { useNavigate } from 'react-router-dom';
import { FILA_ALERTA_ACTIVADA } from '../../../shared/theme/paletaColores';

export function TablaPersonasParticulares({ personas, hayFiltrosActivos = false }) {
  const navigate = useNavigate();

  const irAInforme = (id) => navigate(`/dashboard/informe-particular/${id}`);

  if (personas.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">
          {hayFiltrosActivos
            ? 'No se encontraron personas con estos criterios.'
            : 'No hay Personas Particulares registradas aún.'}
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
              <th className="p-4 font-bold border-b border-gray-200">Persona Particular</th>
              <th className="p-4 font-bold border-b border-gray-200">Centro de Salud</th>
              <th className="p-4 font-bold border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {personas.map((persona) => (
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
                  <span className="align-middle">{persona.nombre || 'Sin nombre registrado'}</span>
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