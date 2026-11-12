// Detalle de UNA pasante para la Docente Supervisora. Pestañas: "Resumen"
// (totales y evaluaciones por formulario), "Personas" (con acceso al
// informe individual), "Formularios habilitados" y "Calificación" (registrar
// una nueva y ver el historial).
//
// DetallePasante solo lee el id de la URL y monta el contenido con
// `key={idPasante}`: al cambiar de pasante el contenido se desmonta y el
// hook arranca limpio (ver useDetallePasante).
//
// Si la pasante no existe o no está marcada como tal, se muestra un solo
// aviso: la base no distingue ambos casos y la pantalla tampoco.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { useDetallePasante } from '../hooks/useDetallePasante';
import { ResumenPasante } from '../components/ResumenPasante';
import { TablaPersonasAtendidas } from '../components/TablaPersonasAtendidas';
import { TablaFormulariosHabilitados } from '../components/TablaFormulariosHabilitados';
import { FormularioCalificacion } from '../components/FormularioCalificacion';
import { HistorialCalificaciones } from '../components/HistorialCalificaciones';

const PESTANAS = [
  { id: 'resumen', etiqueta: 'Resumen' },
  { id: 'personas', etiqueta: 'Personas' },
  { id: 'formularios', etiqueta: 'Formularios habilitados' },
  { id: 'calificacion', etiqueta: 'Calificación' },
];

export default function DetallePasante() {
  const { idPasante } = useParams();
  return <DetallePasanteContenido key={idPasante} idPasante={idPasante} />;
}

function DetallePasanteContenido({ idPasante }) {
  const { pasante, instrumentos, personas, habilitaciones, calificaciones, loading, error, calificar } =
    useDetallePasante(idPasante);
  const [pestanaActiva, setPestanaActiva] = useState('resumen');

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <BarraSuperior titulo="Supervisión de Pasantías (Docente Supervisora)" />

      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto">
        <Link
          to="/supervision-pasantias"
          className="inline-block mb-6 text-gray-500 hover:text-orange-700 font-bold transition-colors"
        >
          ← Volver a la lista de pasantes
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-gray-700 font-semibold">Cargando información de la pasante...</span>
          </div>
        ) : !pasante ? (
          !error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
              <p className="font-bold">⚠️ No se encontró a la pasante</p>
              <p className="text-sm mt-1">Puede que no exista o que ya no esté a tu cargo.</p>
            </div>
          )
        ) : (
          <>
            <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
              {PESTANAS.map((pestana) => (
                <button
                  key={pestana.id}
                  type="button"
                  onClick={() => setPestanaActiva(pestana.id)}
                  className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors ${
                    pestanaActiva === pestana.id
                      ? COLOR_MARCA.violetaSuave.tabActivo
                      : 'border-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {pestana.etiqueta}
                </button>
              ))}
            </div>

            {pestanaActiva === 'resumen' && (
              <ResumenPasante
                pasante={pasante}
                instrumentos={instrumentos}
                personas={personas}
                habilitaciones={habilitaciones}
              />
            )}

            {pestanaActiva === 'personas' && <TablaPersonasAtendidas idPasante={idPasante} personas={personas} />}

            {pestanaActiva === 'formularios' && <TablaFormulariosHabilitados habilitaciones={habilitaciones} />}

            {pestanaActiva === 'calificacion' && (
              <div className="space-y-6">
                <FormularioCalificacion onGuardar={calificar} />
                <HistorialCalificaciones calificaciones={calificaciones} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
