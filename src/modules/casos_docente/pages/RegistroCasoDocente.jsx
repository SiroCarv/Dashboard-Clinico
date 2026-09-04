// Pantalla principal del docente (reemplaza al flujo de SCRUM-51): un
// formulario para registrar un nuevo reporte + el historial de los que
// ya envió, siempre visible debajo -- "evidencia de su trabajo"
// (criterio de aceptación). Sin pasos ni pestañas: un solo formulario de
// una sola pantalla, a propósito mucho más simple que el flujo anterior
// (seleccionar alumno + completar dos instrumentos completos).
import { useEffect, useState } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import BarraSuperior from '../../../shared/components/BarraSuperior';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { casosDocenteService } from '../services/casosDocenteService';
import FormularioReporteDocente from '../components/FormularioReporteDocente';
import HistorialReportesDocente from '../components/HistorialReportesDocente';

const VALORES_INICIALES = {
  nombreAlumno: '',
  apellidoAlumno: '',
  curso: '',
  paralelo: '',
  turno: '',
  descripcion: '',
};

export default function RegistroCasoDocente() {
  const [docenteId, setDocenteId] = useState(null);
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const [reportes, setReportes] = useState([]);
  const [cargandoReportes, setCargandoReportes] = useState(true);

  const cargarMisReportes = async (idDocente) => {
    try {
      setCargandoReportes(true);
      const lista = await casosDocenteService.obtenerMisReportes(idDocente);
      setReportes(lista);
    } catch (err) {
      console.error('Error al cargar tus reportes:', err.message);
    } finally {
      setCargandoReportes(false);
    }
  };

  useEffect(() => {
    let activo = true;
    async function iniciar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!activo || !session?.user) return;
      setDocenteId(session.user.id);
      await cargarMisReportes(session.user.id);
    }
    iniciar();
    return () => {
      activo = false;
    };
  }, []);

  const handleCambiar = (campo, valor) => {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    setMensajeExito('');
  };

  const handleEnviar = async () => {
    if (!docenteId) return;
    setEnviando(true);
    setErrorEnvio('');
    try {
      await casosDocenteService.registrarReporte({ docenteId, ...valores });
      setValores(VALORES_INICIALES);
      setMensajeExito('Reporte enviado correctamente.');
      await cargarMisReportes(docenteId);
    } catch (err) {
      console.error('Error al registrar el reporte:', err.message);
      setErrorEnvio('No se pudo registrar el reporte. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />
      <BarraSuperior titulo="Reportes de seguimiento" />

      <div className="relative z-10 p-6 md:p-10 max-w-3xl mx-auto space-y-8">
        {mensajeExito && (
          <div className="p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-sm text-center font-bold">
            {mensajeExito}
          </div>
        )}

        <FormularioReporteDocente
          valores={valores}
          onCambiar={handleCambiar}
          onEnviar={handleEnviar}
          enviando={enviando}
          error={errorEnvio}
        />

        <div>
          <h3 className="text-lg font-extrabold text-black mb-3">Tus reportes anteriores</h3>
          <HistorialReportesDocente reportes={reportes} cargando={cargandoReportes} />
        </div>
      </div>
    </div>
  );
}