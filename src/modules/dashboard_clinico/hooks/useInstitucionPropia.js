// Hook chico y aislado: trae una sola vez, al montar, la institución del/la
// psicólogo/a autenticado/a (nombre y tipo; ver
// pacientesService.obtenerInstitucionPropia). Lo consume Dashboard.jsx
// para dos cosas: mostrar el nombre junto al título (BadgeInstitucion) y
// decidir si pasarle `soloPersonaParticular={true}` a ResumenFormularios.jsx
// (historia "Filtrado de formularios según el tipo de psicólogo/a").
// Ambas cosas salen de la misma consulta, así que se pide una sola vez.
// Separado de useListaPacientes a propósito: son dos preguntas distintas
// (quiénes son mis pacientes / en qué institución trabajo yo), aunque
// ambas terminen resolviéndose contra la misma tabla
// `psicologo_institucion`.
import { useEffect, useState } from 'react';
import { pacientesService } from '../services/pacientesService';

export function useInstitucionPropia() {
  // `institucion` arranca en `null` (mismo valor que "sin institución") y
  // `tipoInstitucion` se deriva de ahí: mientras carga o si la consulta
  // falla queda en `null`, que Dashboard.jsx trata como "mostrar todos los
  // formularios" — nunca se ocultan de más por accidente. Por eso la
  // pantalla debe mirar `cargando` y `error` antes de decir "sin
  // institución", para no confundir "no tiene" con "no se pudo consultar".
  const [institucion, setInstitucion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    pacientesService
      .obtenerInstitucionPropia()
      .then((data) => {
        if (activo) setInstitucion(data);
      })
      .catch((err) => {
        console.error('Error al obtener la institución propia:', err.message);
        if (activo) setError('No se pudo cargar la institución.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return {
    institucion,
    tipoInstitucion: institucion?.tipoInstitucion ?? null,
    cargando,
    error,
  };
}