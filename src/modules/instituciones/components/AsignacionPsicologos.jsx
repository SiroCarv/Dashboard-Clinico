import { useState, useEffect } from 'react';
import { psicologoInstitucionService } from '../services/psicologoInstitucionService';

export const AsignacionPsicologos = ({ instituciones }) => {
  const [psicologos, setPsicologos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionPorPsicologo, setSeleccionPorPsicologo] = useState({});
  const [guardandoId, setGuardandoId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [psicologosData, asignacionesData] = await Promise.all([
        psicologoInstitucionService.getPsicologos(),
        psicologoInstitucionService.getAsignaciones(),
      ]);
      setPsicologos(psicologosData);
      setAsignaciones(asignacionesData);
    } catch (err) {
      setError('Error al cargar los psicólogos o sus asignaciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const institucionesDe = (psicologoId) =>
    asignaciones
      .filter((a) => a.psicologo_id === psicologoId)
      .map((a) => instituciones.find((i) => i.id === a.institucion_id))
      .filter(Boolean);

  const institucionesDisponiblesPara = (psicologoId) => {
    const asignadasIds = asignaciones
      .filter((a) => a.psicologo_id === psicologoId)
      .map((a) => a.institucion_id);
    return instituciones.filter((i) => !asignadasIds.includes(i.id));
  };

  const handleAsignar = async (psicologoId) => {
    const institucionId = seleccionPorPsicologo[psicologoId];
    if (!institucionId) return;

    setGuardandoId(psicologoId);
    try {
      await psicologoInstitucionService.asignar(psicologoId, institucionId);
      await cargarDatos();
      setSeleccionPorPsicologo((prev) => ({ ...prev, [psicologoId]: '' }));
    } catch (err) {
      alert('Error al asignar la institución: ' + err.message);
      console.error(err);
    } finally {
      setGuardandoId(null);
    }
  };

  const handleQuitar = async (psicologoId, institucionId) => {
    setGuardandoId(psicologoId);
    try {
      await psicologoInstitucionService.desasignar(psicologoId, institucionId);
      await cargarDatos();
    } catch (err) {
      alert('Error al quitar la institución: ' + err.message);
      console.error(err);
    } finally {
      setGuardandoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
        {error}
      </div>
    );
  }

  if (psicologos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">No hay psicólogos registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-gray-200">Psicólogo</th>
              <th className="p-4 font-semibold border-b border-gray-200">Instituciones asignadas</th>
              <th className="p-4 font-semibold border-b border-gray-200 text-right">Asignar nueva</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {psicologos.map((psi) => (
              <tr key={psi.id} className="hover:bg-gray-50 transition-colors align-top">
                <td className="p-4 text-gray-800 font-medium">
                  {psi.email || <span className="text-gray-400 italic">Sin email registrado</span>}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {institucionesDe(psi.id).length === 0 ? (
                      <span className="text-gray-400 text-sm">Sin instituciones asignadas</span>
                    ) : (
                      institucionesDe(psi.id).map((inst) => (
                        <span
                          key={inst.id}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-900 rounded-full text-sm font-medium"
                        >
                          {inst.nombre}
                          <button
                            onClick={() => handleQuitar(psi.id, inst.id)}
                            disabled={guardandoId === psi.id}
                            className="text-blue-900 hover:text-red-600 font-bold disabled:opacity-50"
                            title="Quitar institución"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <select
                      value={seleccionPorPsicologo[psi.id] || ''}
                      onChange={(e) =>
                        setSeleccionPorPsicologo((prev) => ({ ...prev, [psi.id]: e.target.value }))
                      }
                      disabled={guardandoId === psi.id}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    >
                      <option value="">Selecciona institución...</option>
                      {institucionesDisponiblesPara(psi.id).map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAsignar(psi.id)}
                      disabled={guardandoId === psi.id || !seleccionPorPsicologo[psi.id]}
                      className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Asignar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};