// Catálogo COMPLETO de psicólogos, para el filtro del Panel Consolidado
// del superadministrador. Mismo criterio que useInstitucionesCatalogo.js:
// no se deriva de los resultados ya cargados (dejaría afuera a un
// psicólogo que todavía no tiene ninguna evaluación asignada), se trae
// directo del módulo `psicologos` a través de su API pública.
//
// El filtro sigue comparando por nombre (mismo criterio que ya usaba
// PanelConsolidadoSuperadmin.jsx para institución y psicólogo antes de
// esta corrección) — si dos psicólogos llegaran a compartir nombre
// exacto, el filtro los mostraría juntos. Es una limitación preexistente
// del diseño de filtros de esta pantalla, no algo introducido acá; una
// migración a filtrar por id quedaría como una historia aparte.
import { useEffect, useState } from 'react';
import { psicologosService } from '../../psicologos';

export function usePsicologosCatalogo() {
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setError(null);
        const data = await psicologosService.listarTodos();
        if (activo) {
          const nombres = data
            .map((p) => p.nombre)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          setPsicologos(nombres);
        }
      } catch (err) {
        console.error('Error al cargar el catálogo de psicólogos:', err.message);
        if (activo) setError('No se pudieron cargar los psicólogos.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  return { psicologos, loading, error };
}
