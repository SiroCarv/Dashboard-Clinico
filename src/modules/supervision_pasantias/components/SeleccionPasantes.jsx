// Tabla con casilla para marcar qué cuentas de psicólogo/a son pasantes (las
// que la Docente Supervisora podrá ver y calificar). Pensada para el
// superadmin, dentro de la pestaña "Supervisora" del Panel Maestro.
//
// Cada casilla guarda al instante (sin botón "Guardar"). Mientras una
// cuenta se está guardando su casilla queda deshabilitada, para evitar
// dobles clics; si falla, el cambio no se muestra y se avisa arriba.
//
// Desmarcar a alguien NO borra sus calificaciones pasadas: solo deja de
// aparecer en la lista de la supervisora (y, si vuelve a marcarse, el
// historial reaparece).
import { useCallback, useEffect, useState } from 'react';
import { cuentaSupervisoraService } from '../services/cuentaSupervisoraService';
import { ETIQUETA_TURNO_PSICOLOGO } from '../../psicologos';

export function SeleccionPasantes() {
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardandoId, setGuardandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const data = await cuentaSupervisoraService.listarPsicologos();
        if (activo) setPsicologos(data);
      } catch (err) {
        console.error('Error cargando psicólogos:', err.message);
        if (activo) setError('No se pudo cargar la lista de psicólogos/as.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const alternar = useCallback(async (psicologo) => {
    setGuardandoId(psicologo.id);
    setError(null);
    try {
      if (psicologo.esPasante) {
        await cuentaSupervisoraService.desmarcarPasante(psicologo.id);
      } else {
        await cuentaSupervisoraService.marcarPasante(psicologo.id);
      }
      setPsicologos((previo) =>
        previo.map((p) => (p.id === psicologo.id ? { ...p, esPasante: !psicologo.esPasante } : p))
      );
    } catch (err) {
      console.error('Error al actualizar la marca de pasante:', err.message);
      setError('No se pudo guardar el cambio. Intenta de nuevo.');
    } finally {
      setGuardandoId(null);
    }
  }, []);

  const texto = busqueda.trim().toLowerCase();
  const visibles = psicologos.filter(
    (p) =>
      texto === '' || p.nombre?.toLowerCase().includes(texto) || p.institucion?.toLowerCase().includes(texto)
  );
  const totalPasantes = psicologos.filter((p) => p.esPasante).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-black">Pasantes a su cargo</h2>
          <p className="text-xs text-gray-700 font-medium">
            Marca las cuentas de psicólogo/a que son estudiantes en pasantía: solo ellas aparecen en el panel de la
            Docente Supervisora. Marcadas: {totalPasantes}.
          </p>
        </div>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o institución..."
          className="sm:w-72 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Pasante
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Psicólogo/a
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Institución
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Turno / Cargo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span className="text-sm text-gray-500 font-medium">Sincronizando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : visibles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-sm font-medium text-gray-400 bg-gray-50">
                    <p className="text-gray-500 text-base font-bold">
                      {psicologos.length === 0 ? 'No hay psicólogos/as registrados/as' : 'Sin resultados'}
                    </p>
                  </td>
                </tr>
              ) : (
                visibles.map((psicologo) => (
                  <tr key={psicologo.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={psicologo.esPasante}
                        disabled={guardandoId === psicologo.id}
                        onChange={() => alternar(psicologo)}
                        aria-label={`Marcar a ${psicologo.nombre || psicologo.email} como pasante`}
                        className="h-5 w-5 accent-violet-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-semibold text-gray-800">
                        {psicologo.nombre || (
                          <span className="text-gray-400 italic font-normal">Sin nombre registrado</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{psicologo.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {psicologo.institucion || <span className="text-gray-400 italic">Sin institución</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ETIQUETA_TURNO_PSICOLOGO[psicologo.turno] || (
                        <span className="text-gray-400 italic">Sin definir</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
