// Envuelve TODA la app (ver App.jsx) para cerrar la sesión
// automáticamente si la pestaña se cerró y se volvió a abrir — pero NO
// si el usuario solo recargó la página (F5) o navegó dentro del mismo
// sitio. Complementa a la historia "Sesión única por cuenta": si alguien
// cierra el navegador sin darle a "Cerrar sesión", esto libera la cuenta
// para que pueda volver a entrar (o para que otra persona pueda usarla)
// la próxima vez que se abra una pestaña nueva.
//
// Cómo distingue "recargué" de "cerré y volví a abrir": usa
// `sessionStorage`, que el navegador borra cuando la PESTAÑA se cierra
// pero mantiene intacto ante una recarga.
//   - Si la marca de "pestaña activa" ya está puesta -> esta pestaña
//     viene abierta desde antes -> no se toca nada.
//   - Si NO está -> o es la primera apertura, o se cerró y se volvió a
//     abrir -> si había una sesión (heredada de localStorage, que sí
//     sobrevive el cierre de pestaña), se cierra y se manda a Login. Si
//     no había sesión, no se fuerza ninguna navegación, para que un
//     enlace público (ej. el registro de una institución) siga
//     funcionando normal.
//
// Por qué no se usa "beforeunload"/"pagehide" para disparar el cierre en
// el momento exacto en que se cierra la pestaña: una llamada de red
// asíncrona ahí no es confiable, muchos navegadores cortan la petición a
// mitad de camino. Revisar al ABRIR es 100% confiable porque no depende
// de que nada termine de ejecutarse durante el cierre.
//
// Excepción para Inicio ("/"): es una pantalla pública sin nada sensible
// que "flashear", así que no tiene sentido hacerla esperar a que termine
// esta verificación — se muestra de inmediato y la limpieza sigue
// corriendo en segundo plano igual. El resto de rutas (incluidas las
// protegidas) sigue bloqueando: ahí sí importa el orden, porque si no se
// bloquean, RutaProtegida podría leer una sesión todavía no invalidada y
// mostrar por un instante una pantalla privada antes de que este
// guardián alcance a cerrarla.
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

// Rutas que se muestran de inmediato, sin esperar el resultado de la
// verificación (ver comentario de arriba).
const RUTAS_SIN_BLOQUEO = ['/'];

export default function GuardianDeSesion({ children }) {
  const sinBloqueo = RUTAS_SIN_BLOQUEO.includes(window.location.pathname);
  const [listo, setListo] = useState(sinBloqueo);
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

            // Si ya estábamos mostrando "/" sin bloqueo, no hace falta
            // navegar: ya estamos ahí. Para cualquier otra ruta, recién
            // acá lo mandamos a Inicio.
            if (activo && !sinBloqueo) navigate('/', { replace: true });
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