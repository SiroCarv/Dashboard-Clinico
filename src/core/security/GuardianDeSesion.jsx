import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

const CLAVE_PESTANA = 'pestana_activa';

// Rutas donde NUNCA hay que tocar la sesión al abrir, aunque no exista
// la marca de "pestaña activa": /restablecer-password depende de la
// sesión "oculta" que Supabase abre al hacer clic en el link del correo
// de recuperación (ver comentario en RestablecerPassword.jsx). Si este
// guardián la cerrara por error, la recuperación de contraseña se rompe
// apenas se abre el link.
const RUTAS_EXENTAS = ['/restablecer-password'];

// Cierra la sesión automáticamente si la pestaña se cerró y se volvió a
// abrir — pero NO si solo se recargó la página (F5) o se navegó dentro
// del mismo sitio.
//
// La pieza clave es `sessionStorage`: el navegador la borra cuando la
// PESTAÑA se cierra, pero la mantiene intacta ante una recarga. Entonces:
//   - Si la marca ya está → esta pestaña estuvo abierta todo este tiempo
//     → no se toca nada.
//   - Si la marca NO está → o es la primera apertura, o se cerró y se
//     volvió a abrir → si había una sesión (heredada de localStorage, que
//     SÍ sobrevive el cierre de pestaña), se cierra y se manda al inicio.
//     Si no había sesión, no se fuerza ninguna navegación — así un enlace
//     público (ej. registro de una institución) sigue funcionando normal.
//
// A propósito NO se usa "beforeunload"/"pagehide" para disparar el cierre
// de sesión en el momento en que la pestaña se cierra: una llamada de red
// asíncrona (avisarle al servidor) no es confiable ahí, muchos
// navegadores cortan la petición a mitad de camino. Revisar al ABRIR es
// 100% confiable porque no depende de que nada termine de ejecutarse
// durante el cierre.
export default function GuardianDeSesion({ children }) {
  const [listo, setListo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    async function verificar() {
      const pestanaYaEstabaAbierta = sessionStorage.getItem(CLAVE_PESTANA);

      if (!pestanaYaEstabaAbierta) {
        const rutaExenta = RUTAS_EXENTAS.includes(window.location.pathname);

        if (!rutaExenta) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            try {
              await supabase.rpc('cerrar_sesion_unica');
            } catch (err) {
              console.error('No se pudo liberar la sesión única al reabrir:', err.message);
            }
            await supabase.auth.signOut();

            if (activo) navigate('/', { replace: true });
          }
        }

        sessionStorage.setItem(CLAVE_PESTANA, '1');
      }

      if (activo) setListo(true);
    }

    verificar();

    return () => {
      activo = false;
    };
    // Solo debe correr una vez, al montar la app — no depende de la ruta
    // actual ni de re-renders posteriores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!listo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
        Cargando...
      </div>
    );
  }

  return children;
}