// Formularios que el estudiante puede responder ahora mismo (los que su
// psicólogo/a habilitó para su institución). Se vuelve a consultar al
// volver a la pestaña del navegador y con `recargar()`, para que el
// estudiante vea un formulario nuevo sin cerrar sesión.
import { useCallback, useEffect, useState } from 'react';
import { habilitacionesService } from '../services/habilitacionesService';

export function useFormulariosHabilitados(activo = true) {
  const [habilitados, setHabilitados] = useState(() => new Set());
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(null);

  const recargar = useCallback(
    () =>
      habilitacionesService
        .listarHabilitadosPropios()
        .then((tipos) => {
          setHabilitados(new Set(tipos));
          setError(null);
        })
        .catch((err) => {
          console.error('Error al cargar los formularios habilitados:', err.message);
          setError('No se pudo comprobar qué formularios están habilitados.');
        })
        .finally(() => setListo(true)),
    []
  );

  useEffect(() => {
    if (!activo) return undefined;

    recargar();

    const alVolver = () => {
      if (document.visibilityState === 'visible') recargar();
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, [activo, recargar]);

  // `cargando` es true desde que el hook se activa hasta la primera
  // respuesta, para que no se vea un instante la pantalla de espera.
  return { habilitados, cargando: activo && !listo, error, recargar };
}
