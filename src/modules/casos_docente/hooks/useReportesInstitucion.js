// Trae los reportes de docentes visibles para el psicólogo autenticado
// (alcance ya resuelto por RLS) -- mismo patrón de hook que ya usa
// dashboard_clinico (useListaPacientes, useIndicadoresGSHS) para que
// Dashboard.jsx pueda consumir esto igual que sus otras pestañas.
import { useEffect, useState } from 'react';
import { casosDocenteService } from '../services/casosDocenteService';

export function useReportesInstitucion() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        setLoading(true);
        const data = await casosDocenteService.obtenerReportesInstitucion();
        if (activo) setReportes(data);
      } catch (err) {
        console.error('Error al cargar reportes de la institución:', err.message);
        if (activo) setError('No se pudieron cargar los reportes.');
      } finally {
        if (activo) setLoading(false);
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return { reportes, loading, error };
}