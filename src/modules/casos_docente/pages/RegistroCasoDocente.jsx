// Pantalla principal del docente (SCRUM-51). Flujo en 4 pasos:
//   1. 'seleccion'   -> elige un alumno de su institución
//   2. 'cuestionario' -> completa Clima de Aula Y GSHS (ambos, igual que
//      hoy el estudiante), en pestañas, sin enviarse todavía
//   3. 'psicologo'   -> recién ACÁ elige quién revisará el caso
//      (criterio: el psicólogo se elige ANTES de confirmar el envío)
//   4. 'exito'        -> confirmación, con opción de registrar otro caso
//
// Los dos cuestionarios se mantienen vivos en simultáneo (ambos hooks
// llamados siempre, sin importar la pestaña activa) para no perder el
// progreso del que no se está viendo al cambiar de pestaña.
import { useEffect, useState } from 'react';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { INSTRUMENTO_CLIMA_AULA, INSTRUMENTO_GSHS } from '../../evaluaciones';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { casosDocenteService } from '../services/casosDocenteService';
import { useCuestionarioCaso } from '../hooks/useCuestionarioCaso';
import FormularioCasoInstrumento from '../components/FormularioCasoInstrumento';
import SelectorAlumno from '../components/SelectorAlumno';
import SelectorPsicologo from '../components/SelectorPsicologo';

export default function RegistroCasoDocente() {
  const [paso, setPaso] = useState('seleccion');

  const [alumnos, setAlumnos] = useState([]);
  const [psicologos, setPsicologos] = useState([]);
  const [cargandoListas, setCargandoListas] = useState(true);
  const [errorListas, setErrorListas] = useState('');

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [tabActiva, setTabActiva] = useState('clima_aula');
  const [psicologoId, setPsicologoId] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const climaAula = useCuestionarioCaso(INSTRUMENTO_CLIMA_AULA);
  const gshs = useCuestionarioCaso(INSTRUMENTO_GSHS);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        setCargandoListas(true);
        const [listaAlumnos, listaPsicologos] = await Promise.all([
          casosDocenteService.obtenerAlumnosPropios(),
          casosDocenteService.obtenerPsicologosPropios(),
        ]);
        if (!activo) return;
        setAlumnos(listaAlumnos);
        setPsicologos(listaPsicologos);
      } catch (err) {
        console.error('Error al cargar alumnos/psicólogos:', err.message);
        if (activo) setErrorListas('No se pudieron cargar los datos de tu institución.');
      } finally {
        if (activo) setCargandoListas(false);
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const elegirAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setPaso('cuestionario');
  };

  const intentarIrAPsicologo = () => {
    const climaOk = climaAula.intentarValidar();
    const gshsOk = gshs.intentarValidar();
    if (!climaOk) {
      setTabActiva('clima_aula');
      return;
    }
    if (!gshsOk) {
      setTabActiva('gshs');
      return;
    }
    setPaso('psicologo');
  };

  const confirmarCaso = async () => {
    if (!psicologoId) return;
    setEnviando(true);
    setErrorEnvio('');
    try {
      await casosDocenteService.registrarCaso({
        idAlumno: alumnoSeleccionado.id,
        psicologoId,
        respuestasClima: climaAula.respuestasJson(),
        respuestasGshs: gshs.respuestasJson(),
      });
      setPaso('exito');
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const registrarOtroCaso = () => {
    setAlumnoSeleccionado(null);
    setPsicologoId('');
    setPaso('seleccion');
    // Los hooks de cuestionario NO se reinician solos (mismo problema
    // que resolvía key={tab.id} en Encuesta.jsx) — al no haber un
    // remount acá, se fuerza recargando la página completa, la forma
    // más simple de garantizar un estado 100% limpio para el próximo caso.
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />
      <BarraSuperior titulo="Registrar caso — Observatorio de Salud Mental" />

      <div className="relative z-10 p-6 md:p-10 max-w-3xl mx-auto">
        {errorListas && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            {errorListas}
          </div>
        )}

        {paso === 'seleccion' && (
          <SelectorAlumno alumnos={alumnos} cargando={cargandoListas} onSeleccionar={elegirAlumno} />
        )}

        {paso === 'cuestionario' && alumnoSeleccionado && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Registrando caso de <span className="font-bold text-black">{alumnoSeleccionado.nombre}</span>
            </p>

            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {[
                { id: 'clima_aula', etiqueta: 'Clima de Aula', acento: COLOR_MARCA.tealAzulado, listo: climaAula.todoRespondido },
                { id: 'gshs', etiqueta: 'GSHS', acento: COLOR_MARCA.verdeMenta, listo: gshs.todoRespondido },
              ].map(({ id, etiqueta, acento, listo }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTabActiva(id)}
                  className={`px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                    tabActiva === id ? acento.tabActivo : 'border-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {etiqueta}
                  {listo && <span className="text-green-600">✓</span>}
                </button>
              ))}
            </div>

            {tabActiva === 'clima_aula' ? (
              <FormularioCasoInstrumento
                instrumento={INSTRUMENTO_CLIMA_AULA}
                acento={COLOR_MARCA.tealAzulado}
                cuestionario={climaAula}
              />
            ) : (
              <FormularioCasoInstrumento
                instrumento={INSTRUMENTO_GSHS}
                acento={COLOR_MARCA.verdeMenta}
                cuestionario={gshs}
              />
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={intentarIrAPsicologo}
                className="px-6 py-2.5 rounded-md font-bold text-white uppercase tracking-wide shadow-md transition-colors bg-violet-400 hover:bg-violet-500"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {paso === 'psicologo' && (
          <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-6">
            <h3 className="text-lg font-extrabold text-black mb-1">Último paso</h3>
            <p className="text-gray-500 text-sm mb-4">
              Elige quién revisará el caso de <span className="font-bold">{alumnoSeleccionado.nombre}</span> antes de confirmar.
            </p>

            <SelectorPsicologo
              psicologos={psicologos}
              cargando={cargandoListas}
              psicologoId={psicologoId}
              onCambiar={setPsicologoId}
            />

            {errorEnvio && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
                {errorEnvio}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setPaso('cuestionario')}
                className="px-4 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={confirmarCaso}
                disabled={!psicologoId || enviando}
                className="px-6 py-2.5 rounded-md font-bold text-white uppercase tracking-wide shadow-md transition-colors bg-violet-400 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? 'Registrando...' : 'Confirmar y registrar caso'}
              </button>
            </div>
          </div>
        )}

        {paso === 'exito' && (
          <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 p-8 text-center">
            <div className="mb-4 p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-sm font-bold">
              Caso registrado correctamente
            </div>
            <p className="text-gray-500 text-sm mb-6">El psicólogo elegido revisará el caso a la brevedad.</p>
            <button
              type="button"
              onClick={registrarOtroCaso}
              className="px-6 py-2.5 rounded-md font-bold text-white uppercase tracking-wide shadow-md transition-colors bg-violet-400 hover:bg-violet-500"
            >
              Registrar otro caso
            </button>
          </div>
        )}
      </div>
    </div>
  );
}