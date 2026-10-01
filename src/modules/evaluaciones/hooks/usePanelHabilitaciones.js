// Estado de la pestaña "Formularios" del psicólogo/a: su institución y qué
// formularios tiene habilitados. Cada cambio se refleja al instante en
// pantalla y se revierte si el guardado falla.
import { useCallback, useEffect, useState } from 'react';
import { habilitacionesService } from '../services/habilitacionesService';

export function usePanelHabilitaciones() {
  const [institucion, setInstitucion] = useState(null);
  const [estados, setEstados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardandoTipo, setGuardandoTipo] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const propia = await habilitacionesService.obtenerInstitucionPropia();
        if (!activo) return;
        setInstitucion(propia);

        if (propia) {
          const filas = await habilitacionesService.listarDeInstitucion(propia.id);
          if (!activo) return;
          setEstados(Object.fromEntries(filas.map((f) => [f.tipo_instrumento, f.habilitado])));
        }
      } catch (err) {
        console.error('Error al cargar la habilitación de formularios:', err.message);
        if (activo) setError('No se pudo cargar la habilitación de formularios.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const alternar = useCallback(
    async (tipoInstrumento) => {
      if (!institucion || guardandoTipo) return;

      const nuevoValor = !estados[tipoInstrumento];
      setError(null);
      setGuardandoTipo(tipoInstrumento);
      setEstados((prev) => ({ ...prev, [tipoInstrumento]: nuevoValor }));

      try {
        await habilitacionesService.cambiarEstado(institucion.id, tipoInstrumento, nuevoValor);
      } catch (err) {
        console.error('Error al cambiar la habilitación:', err.message);
        setEstados((prev) => ({ ...prev, [tipoInstrumento]: !nuevoValor }));
        setError('No se pudo guardar el cambio. Inténtalo de nuevo.');
      } finally {
        setGuardandoTipo(null);
      }
    },
    [institucion, estados, guardandoTipo]
  );

  return { institucion, estados, cargando, error, guardandoTipo, alternar };
}
