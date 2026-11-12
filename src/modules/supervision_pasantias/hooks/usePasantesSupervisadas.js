// Carga, una sola vez al montar, la lista de pasantes con sus totales para
// el panel de la Docente Supervisora. PanelSupervisora.jsx aplica la
// búsqueda sobre el arreglo que devuelve; este hook solo trae los datos.
//
// Sin Realtime a propósito (a diferencia del Dashboard del psicólogo): la
// supervisora revisa trabajo ya hecho, no atiende alertas en vivo, y las
// cifras se recalculan al volver a entrar a la pantalla.
import { useEffect, useState } from 'react';
import { supervisionPasantiasService } from '../services/supervisionPasantiasService';

export function usePasantesSupervisadas() {
  const [pasantes, setPasantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    // La carga inicial ya arranca con loading=true (useState de arriba), por
    // eso acá no se vuelve a poner en true.
    async function cargar() {
      try {
        setError(null);
        const data = await supervisionPasantiasService.listarPasantes();
        if (activo) setPasantes(data);
      } catch (err) {
        console.error('Error al cargar la lista de pasantes:', err.message);
        if (activo) setError('No se pudo cargar la lista de pasantes.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  return { pasantes, loading, error };
}
