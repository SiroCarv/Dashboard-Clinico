// Hook chico y aislado: trae una sola vez, al montar, el tipo de
// institución del/la psicólogo/a autenticado/a (ver
// pacientesService.obtenerTipoInstitucionPropia). Lo consume
// Dashboard.jsx para decidir si pasarle `soloPersonaParticular={true}` a
// ResumenFormularios.jsx (historia "Filtrado de formularios según el
// tipo de psicólogo/a"). Separado de useListaPacientes a propósito: son
// dos preguntas distintas (quiénes son mis pacientes / en qué tipo de
// institución trabajo yo), aunque ambas terminen resolviéndose contra la
// misma tabla `psicologo_institucion`.
import { useEffect, useState } from 'react';
import { pacientesService } from '../services/pacientesService';

export function useTipoInstitucionPropia() {
  // Arranca en `null` (mismo valor que "colegio o superadmin: mostrar
  // todo") — así, mientras carga, ResumenFormularios.jsx muestra todos
  // los formularios por defecto, nunca los oculta de más por accidente.
  const [tipoInstitucion, setTipoInstitucion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    pacientesService
      .obtenerTipoInstitucionPropia()
      .then((tipo) => {
        if (activo) setTipoInstitucion(tipo);
      })
      .catch((err) => {
        console.error('Error al obtener el tipo de institución propia:', err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return { tipoInstitucion, cargando };
}