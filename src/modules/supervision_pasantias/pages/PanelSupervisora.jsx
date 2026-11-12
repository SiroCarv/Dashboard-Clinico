// Pantalla principal de la Docente Supervisora (rol 'docente_supervisora'):
// lista de las estudiantes en pasantía con sus totales de trabajo y su
// última nota. Cada fila lleva al detalle, donde se revisa el trabajo y se
// califica. Solo lectura: acá no se escribe nada.
//
// Qué pasantes aparecen lo decide la base de datos (cuentas marcadas por el
// superadmin en Panel Maestro > Supervisora), no esta pantalla.
import { useMemo, useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { usePasantesSupervisadas } from '../hooks/usePasantesSupervisadas';
import { TablaPasantes } from '../components/TablaPasantes';

export default function PanelSupervisora() {
  const { pasantes, loading, error } = usePasantesSupervisadas();
  const [busqueda, setBusqueda] = useState('');

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pasantes.filter(
      (p) =>
        texto === '' ||
        p.nombre?.toLowerCase().includes(texto) ||
        p.instituciones?.toLowerCase().includes(texto)
    );
  }, [pasantes, busqueda]);

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Supervisión de Pasantías (Docente Supervisora)" />

      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-black">Estudiantes en pasantía</h2>
          <p className="text-gray-700 mt-1 font-semibold">
            Revisa el trabajo de campo y las evaluaciones aplicadas, y registra la calificación de cada pasante.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-700 font-semibold">Cargando pasantes...</span>
          </div>
        ) : (
          !error && (
            <>
              {pasantes.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o institución..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
                  />
                </div>
              )}

              <TablaPasantes pasantes={filtradas} hayFiltrosActivos={busqueda.trim() !== ''} />
            </>
          )
        )}
      </div>
    </div>
  );
}
