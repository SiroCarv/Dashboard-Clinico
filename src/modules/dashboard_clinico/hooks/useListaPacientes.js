// Carga el listado de pacientes del psicólogo autenticado, una sola vez
// al montar. Dashboard.jsx aplica búsqueda/filtro/exportación sobre el
// array que devuelve este hook — el hook en sí no sabe nada de filtros,
// solo trae los datos.
//
// PASO OPCIONAL (no forma parte del arreglo obligatorio de alertas):
// además se suscribe en tiempo real a nuevos INSERT en
// `evaluaciones_instrumento` y vuelve a cargar el listado cuando entra
// uno — así, si un paciente envía una evaluación con alerta_activada
// mientras el psicólogo tiene el Dashboard abierto, la fila se resalta
// sola sin necesidad de recargar la página. Requiere que la tabla
// `evaluaciones_instrumento` esté agregada a la publicación
// `supabase_realtime` (ver migración en el Paso 4 del reporte de
// auditoría) — si no lo está, este hook sigue funcionando igual, solo
// que sin la actualización automática.
import { useEffect, useState } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import { pacientesService } from '../services/pacientesService';

export function useListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    // Nota: a propósito NO se pone setLoading(true) acá dentro. La carga
    // inicial ya arranca en loading=true por el useState de arriba; si
    // esta misma función se vuelve a llamar por el canal de Realtime de
    // abajo, queremos una recarga silenciosa en segundo plano (la tabla
    // sigue visible), no que parpadee a pantalla de carga cada vez que
    // entra una evaluación nueva.
    async function cargar() {
      try {
        setError(null);
        const data = await pacientesService.obtenerPacientesPropios();
        if (activo) setPacientes(data);
      } catch (err) {
        console.error('Error al cargar la lista de pacientes:', err.message);
        if (activo) setError('No se pudo cargar la lista de pacientes.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    // Vuelve a cargar el listado completo cuando entra una evaluación
    // nueva (no se intenta "parchear" el estado local pregunta por
    // pregunta: es más simple y más confiable recargar desde la fuente
    // de verdad, y el volumen de datos de este listado es chico).
    const canal = supabase
      .channel('dashboard-alertas-pacientes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'evaluaciones_instrumento' },
        () => {
          if (activo) cargar();
        }
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, []);

  return { pacientes, loading, error };
}