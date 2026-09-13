// Obtiene el rol real del usuario autenticado, para que Encuesta.jsx
// decida entre 2 caminos:
//   - 'paciente' (Estudiante): flujo completo existente, con
//     consentimiento/asentimiento (useConsentimiento.js) y los 6
//     formularios de siempre.
//   - 'persona_particular': flujo simplificado — sin consentimiento (ver
//     nota en Encuesta.jsx sobre por qué se excluye a propósito de esta
//     historia) y solo sus 5 formularios propios.
//
// Deliberadamente NO se reutiliza RutaProtegida.jsx para esto: esa pieza
// ya resuelve "¿puede esta persona entrar a esta ruta?" y redirige si no
// — no está pensada para exponerle el rol a la pantalla que envuelve, y
// tocarla para que lo haga afectaría a TODAS las rutas protegidas de la
// app, no solo a Encuesta. Este hook hace una segunda consulta liviana,
// propia y aislada, en vez de eso.
import { useEffect, useState } from 'react';
import { supabase } from '../../../core/api/supabaseClient';

export function useRolEvaluacion() {
  const [rol, setRol] = useState(null);
  const [idUsuario, setIdUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (activo) setCargando(false);
        return;
      }

      const { data, error } = await supabase.from('usuarios').select('rol').eq('id', session.user.id).single();

      if (activo) {
        if (!error && data) {
          setRol(data.rol);
          setIdUsuario(session.user.id);
        }
        setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return { rol, idUsuario, cargando };
}