// Catálogo COMPLETO de instituciones, para poblar los filtros del
// superadministrador (Panel Consolidado, Resultados GSHS).
//
// A propósito NO deriva las opciones de los datos ya cargados (ese es
// el criterio que sigue usando Dashboard.jsx para su propio filtro de
// institución, ver la nota en ese archivo) — acá hace falta el catálogo
// completo, porque una institución sin ningún resultado todavía debe
// poder elegirse igual en el filtro. Por eso trae los datos directo del
// módulo `instituciones`, a través de su API pública (nunca se importa
// institucionesService.js por su ruta interna).
import { useEffect, useState } from 'react';
import { institucionesService } from '../../instituciones';

export function useInstitucionesCatalogo() {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setError(null);
        const data = await institucionesService.getInstituciones();
        if (activo) {
          const nombres = data.map((i) => i.nombre).sort((a, b) => a.localeCompare(b));
          setInstituciones(nombres);
        }
      } catch (err) {
        console.error('Error al cargar el catálogo de instituciones:', err.message);
        if (activo) setError('No se pudieron cargar las instituciones.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  return { instituciones, loading, error };
}
