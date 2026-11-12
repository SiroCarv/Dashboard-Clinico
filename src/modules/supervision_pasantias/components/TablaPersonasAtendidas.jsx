// Personas de las instituciones de la pasante, con búsqueda por nombre y
// acceso al informe individual de cada una. Estudiantes y Personas
// Particulares tienen rutas de informe distintas (App.jsx), por eso el
// destino se elige según el rol de cada fila.
//
// Solo se dibujan las primeras LIMITE_FILAS coincidencias y un botón
// "Mostrar más" amplía de a tandas: un colegio puede tener cientos de
// estudiantes y pintar todas las filas de una vez vuelve lenta la pantalla.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FILA_ALERTA_ACTIVADA } from '../../../shared/theme/paletaColores';
import { ETIQUETA_TIPO_PERSONA } from '../data/etiquetasInstrumento';
import { formatearFecha } from '../utils/formatoFecha';

const LIMITE_FILAS = 100;

export function TablaPersonasAtendidas({ idPasante, personas }) {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(LIMITE_FILAS);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return personas.filter((p) => texto === '' || p.nombre?.toLowerCase().includes(texto));
  }, [personas, busqueda]);

  const visibles = filtradas.slice(0, limite);

  const irAlInforme = (persona) => {
    const base = `/supervision-pasantias/pasante/${encodeURIComponent(idPasante)}`;
    const id = encodeURIComponent(persona.id);
    navigate(persona.rol === 'persona_particular' ? `${base}/informe-particular/${id}` : `${base}/informe/${id}`);
  };

  if (personas.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">Sus instituciones aún no tienen personas registradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setLimite(LIMITE_FILAS);
          }}
          placeholder="Buscar por nombre..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
        />
        <span className="text-sm text-gray-600 font-medium">
          {filtradas.length} {filtradas.length === 1 ? 'persona' : 'personas'}
        </span>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No se encontraron personas con ese nombre.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-gray-200">Persona</th>
                  <th className="p-4 font-bold border-b border-gray-200">Tipo</th>
                  <th className="p-4 font-bold border-b border-gray-200">Institución</th>
                  <th className="p-4 font-bold border-b border-gray-200 text-center">Evaluaciones</th>
                  <th className="p-4 font-bold border-b border-gray-200">Última</th>
                  <th className="p-4 font-bold border-b border-gray-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibles.map((persona) => (
                  <tr
                    key={persona.id}
                    onClick={() => irAlInforme(persona)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        irAlInforme(persona);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer transition-colors ${
                      persona.tieneAlerta ? FILA_ALERTA_ACTIVADA : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="p-4 text-gray-800 font-medium">
                      <span className="align-middle">{persona.nombre || 'Sin nombre registrado'}</span>
                      {persona.tieneAlerta && (
                        <span className="inline-block ml-2 px-2 py-0.5 bg-red-100 border border-red-300 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide align-middle">
                          ⚠️ Alerta
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{ETIQUETA_TIPO_PERSONA[persona.rol] || persona.rol}</td>
                    <td className="p-4 text-gray-600">{persona.institucion || '—'}</td>
                    <td className="p-4 text-gray-800 text-center">{persona.totalEvaluaciones}</td>
                    <td className="p-4 text-gray-600">{formatearFecha(persona.ultimaEvaluacion)}</td>
                    <td className="p-4 text-right text-violet-400 font-bold text-sm whitespace-nowrap">
                      Ver informe →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtradas.length > visibles.length && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setLimite((l) => l + LIMITE_FILAS)}
            className="px-6 py-2.5 rounded-md text-gray-600 hover:bg-gray-100 font-bold transition-colors"
          >
            Mostrar más ({filtradas.length - visibles.length} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
