// Carga los dos datos que necesita la pantalla de Informe Consolidado
// (SCRUM-31) para un paciente puntual: su perfil completo y la lista de
// instrumentos que ya completó — SIN combinar los resultados en un solo
// puntaje o diagnóstico (criterio de aceptación #2 de la historia: cada
// prueba se muestra por separado, cruzarlas es trabajo del profesional).
//
// El acceso fuera de las instituciones asignadas al psicólogo ya lo
// deniega la política RLS del lado de la base de datos (criterio #4): si
// no tiene acceso, `paciente` llega como `null` y `instrumentos` como un
// arreglo vacío, sin distinguir "no existe" de "no autorizado" — la
// página (InformeConsolidado.jsx) trata ambos casos igual.
import { useEffect, useState } from 'react';
import { evaluacionesInstrumentoService } from '../../evaluaciones';
import { pacientesService } from '../services/pacientesService';

export function useInformeConsolidado(idPaciente) {
  const [paciente, setPaciente] = useState(null);
  const [instrumentos, setInstrumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (!idPaciente) return;
      try {
        setLoading(true);
        setError(null);
        const [datosPaciente, datosInstrumentos] = await Promise.all([
          pacientesService.obtenerPacientePropio(idPaciente),
          evaluacionesInstrumentoService.obtenerInstrumentosDePaciente(idPaciente),
        ]);
        if (!activo) return;
        setPaciente(datosPaciente);
        setInstrumentos(datosInstrumentos);
      } catch (err) {
        console.error('Error al cargar el informe consolidado:', err.message);
        if (activo) setError('No se pudo cargar el informe de este paciente.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [idPaciente]);

  return { paciente, instrumentos, loading, error };
}
