import { useEffect, useState } from 'react';
import { evaluacionesInstrumentoService } from '../../evaluaciones';
import { pacientesService } from '../services/pacientesService';

// SCRUM-31 — "Informe Consolidado de Pruebas por Paciente": lista todos
// los tests que un paciente completó, cada uno con su fecha, SIN combinar
// los resultados en un solo puntaje o diagnóstico (criterio de
// aceptación #2). El acceso fuera de las instituciones asignadas ya lo
// deniega la política RLS del lado de la base de datos (criterio #4): si
// el psicólogo no tiene acceso, `paciente` llega como `null` y
// `instrumentos` como un arreglo vacío, sin distinguir "no existe" de
// "no autorizado".
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
