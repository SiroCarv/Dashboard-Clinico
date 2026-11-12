// Carga todo lo que muestra el detalle de UNA pasante (perfil, evaluaciones
// por formulario, personas atendidas, formularios habilitados y su
// historial de calificaciones) y expone `calificar` para registrar una
// nueva.
//
// Si la pasante no existe o no está marcada como tal, `pasante` queda en
// `null` y el resto vacío: la página muestra un único mensaje de "no se
// encontró o sin acceso" (mismo criterio que InformeConsolidado, que no
// distingue ambos casos).
//
// Este hook asume que la página lo monta con `key={idPasante}`: al cambiar
// de pasante se desmonta y vuelve a empezar, así que no hace falta
// reiniciar `loading` desde dentro del efecto.
import { useCallback, useEffect, useState } from 'react';
import { supervisionPasantiasService } from '../services/supervisionPasantiasService';

const ESTADO_VACIO = {
  pasante: null,
  instrumentos: [],
  personas: [],
  habilitaciones: [],
  calificaciones: [],
};

export function useDetallePasante(idPasante) {
  const [datos, setDatos] = useState(ESTADO_VACIO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setError(null);

        // El perfil va primero: si no es una pasante visible, no tiene
        // sentido pedir lo demás.
        const pasante = await supervisionPasantiasService.obtenerPasante(idPasante);
        if (!pasante) return;

        const [instrumentos, personas, habilitaciones, calificaciones] = await Promise.all([
          supervisionPasantiasService.resumenPorInstrumento(idPasante),
          supervisionPasantiasService.personasAtendidas(idPasante),
          supervisionPasantiasService.formulariosHabilitados(idPasante),
          supervisionPasantiasService.calificaciones(idPasante),
        ]);

        if (activo) setDatos({ pasante, instrumentos, personas, habilitaciones, calificaciones });
      } catch (err) {
        console.error('Error al cargar el detalle de la pasante:', err.message);
        if (activo) setError('No se pudo cargar la información de esta pasante.');
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [idPasante]);

  // Si falla, el error se propaga a quien llama (el formulario lo muestra
  // junto al botón) y la lista no se toca.
  const calificar = useCallback(
    async ({ nota, observacion }) => {
      const nueva = await supervisionPasantiasService.calificar({
        pasanteId: idPasante,
        nota,
        observacion,
      });
      setDatos((previo) => ({ ...previo, calificaciones: [nueva, ...previo.calificaciones] }));
    },
    [idPasante]
  );

  return { ...datos, loading, error, calificar };
}
