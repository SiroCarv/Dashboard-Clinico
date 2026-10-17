// Envuelve TODA la app (ver App.jsx) para cerrar la sesión
// automáticamente si la pestaña se cerró y se volvió a abrir — pero NO
// si el usuario solo recargó la página (F5), navegó dentro del mismo
// sitio, o volvió a la plataforma poco después de haberla dejado (ver
// "Ventana de reanudación" más abajo). Complementa a la historia "Sesión
// única por cuenta": si alguien cierra el navegador sin darle a "Cerrar
// sesión", esto libera la cuenta para que pueda volver a entrar (o para
// que otra persona pueda usarla) la próxima vez que se abra una pestaña
// nueva.
//
// Cómo distingue "recargué" de "cerré y volví a abrir": usa
// `sessionStorage`, que el navegador borra cuando la PESTAÑA se cierra
// pero mantiene intacto ante una recarga.
//   - Si la marca de "pestaña activa" ya está puesta -> esta pestaña
//     viene abierta desde antes -> no se toca nada.
//   - Si NO está -> o es la primera apertura, o se cerró y se volvió a
//     abrir -> si había una sesión (heredada de localStorage, que sí
//     sobrevive el cierre de pestaña) y NO hay actividad reciente — o la
//     persona es psicólogo/superadmin, que no tienen ventana — se cierra
//     y se manda a Inicio. Si no había sesión, no se fuerza
//     ninguna navegación, para que un enlace público (ej. el registro de
//     una institución) siga funcionando normal.
//
// Ventana de reanudación (por qué existe): en un celular, al bloquear la
// pantalla o dejar el navegador en segundo plano un buen rato, el sistema
// operativo puede descartar la pestaña para liberar memoria. Al volver,
// la página se carga de cero y `sessionStorage` ya no tiene la marca —
// desde afuera es idéntico a "cerré y volví a abrir", y la persona quedaba
// expulsada a Inicio en medio de la encuesta (reportado por un Centro de
// Salud real, oct. 2026). Para no confundir ambos casos, este guardián
// anota en `localStorage` cuándo fue la última actividad (ver
// CLAVE_ACTIVIDAD): si la sesión sigue ahí y esa actividad fue hace menos
// de VENTANA_REANUDACION_MS, se trata como una reanudación y NO se
// cierra. Pasado ese tiempo vuelve a valer la regla de siempre.
// Contrapartida a tener presente: en una computadora compartida, quien
// cierre la pestaña sin cerrar sesión deja la cuenta abierta durante esa
// ventana — por eso la ventana es acotada y fácil de ajustar.
//
// Sin ventana para psicólogo y superadmin (pedido del cliente, oct. 2026):
// esas dos cuentas manejan información de otras personas y trabajan desde
// equipos que pueden ser compartidos, así que para ellas NO existe la
// reanudación: si la pestaña se cerró y se volvió a abrir, la sesión se
// cierra siempre, sin importar cuánto tiempo pasó (ver
// ROLES_SIN_REANUDACION). La ventana se conserva para el resto de los
// roles — sobre todo estudiante y persona particular, que responden desde
// el celular, que es justamente donde el problema original ocurrió. Para
// consultar el rol hace falta una consulta a la base de datos, que solo se
// hace cuando la ventana podría aplicar (si ya no hay actividad reciente,
// se cierra sin consultar nada).
//
// Complemento: el cierre por inactividad (autenticacion/hooks/
// useCierrePorInactividad.js) acota además cuánto puede estar sin uso
// cualquier sesión — 15 min psicólogo/superadmin/docente, 30 min
// estudiante/persona particular. Ese cierre también corre al volver a
// abrir la app (usa su propia marca de interacción, no la de este
// archivo), así que en la práctica la reanudación de los roles que la
// conservan dura como máximo ese límite, no las 2 horas completas.
//
// Por qué no se usa "beforeunload"/"pagehide" para disparar el CIERRE de
// sesión en el momento exacto en que se cierra la pestaña: una llamada de
// red asíncrona ahí no es confiable, muchos navegadores cortan la
// petición a mitad de camino. Revisar al ABRIR es 100% confiable porque
// no depende de que nada termine de ejecutarse durante el cierre. (Sí se
// usan para ANOTAR la hora de actividad: escribir en `localStorage` es
// síncrono, no necesita red.)
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

// Hora (en milisegundos) de la última actividad registrada en este
// navegador. Vive en localStorage a propósito (sobrevive a que el
// sistema descarte la pestaña) y useCerrarSesion.js la borra junto con el
// resto de claves al cerrar sesión, así que nunca sobrevive a un logout.
const CLAVE_ACTIVIDAD = 'ultima_actividad';

// Cuánto tiempo después de la última actividad una pestaña "nueva" todavía
// se considera la misma sesión que continúa. Subirlo favorece a quien deja
// el celular bloqueado un rato largo; bajarlo protege más a los equipos
// compartidos.
const VENTANA_REANUDACION_MS = 2 * 60 * 60 * 1000;

// Roles a los que NO se les aplica la ventana de reanudación: al volver a
// abrir la pestaña, su sesión se cierra siempre. Agregar o quitar un rol
// acá basta para cambiarlo (los nombres son los de `usuarios.rol`).
const ROLES_SIN_REANUDACION = ['psicologo', 'superadmin'];

// Mientras la persona toca o desplaza la pantalla, la hora se actualiza
// como máximo una vez por este intervalo — para no escribir en
// localStorage en cada gesto.
const INTERVALO_REGISTRO_MS = 30 * 1000;

// Gestos que cuentan como "actividad" de la persona.
const EVENTOS_ACTIVIDAD = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

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

// localStorage puede estar bloqueado (modo privado estricto, almacenamiento
// lleno): en ese caso se devuelve null / se ignora la escritura, y el
// guardián se comporta como antes de existir la ventana de reanudación.
function leerUltimaActividad() {
  try {
    const valor = Number(localStorage.getItem(CLAVE_ACTIVIDAD));
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  } catch {
    return null;
  }
}

function registrarActividad() {
  try {
    localStorage.setItem(CLAVE_ACTIVIDAD, String(Date.now()));
  } catch {
    // Sin almacenamiento disponible no hay nada que hacer: se pierde solo
    // la tolerancia a reanudaciones, no el funcionamiento de la app.
  }
}

// Rol de la persona con sesión (la sesión de Auth no sabe de roles de
// negocio). Si la consulta falla (ej. sin conexión), devuelve null: en ese
// caso no se expulsa a nadie por no poder confirmar su rol — el cierre por
// inactividad sigue acotando la sesión igual.
async function leerRol(userId) {
  try {
    const { data } = await supabase.from('usuarios').select('rol').eq('id', userId).maybeSingle();
    return data?.rol ?? null;
  } catch {
    return null;
  }
}

function hayActividadReciente() {
  const ultima = leerUltimaActividad();
  if (ultima === null) return false;
  const transcurrido = Date.now() - ultima;
  // Un valor "del futuro" (reloj del dispositivo cambiado) no es confiable:
  // se trata como sin actividad reciente.
  return transcurrido >= 0 && transcurrido <= VENTANA_REANUDACION_MS;
}

export default function GuardianDeSesion({ children }) {
  const sinBloqueo = RUTAS_SIN_BLOQUEO.includes(window.location.pathname);
  const [listo, setListo] = useState(sinBloqueo);
  // Se decide en el PRIMER render, antes de que corra cualquier efecto:
  // si se leyera después, el registro de actividad de más abajo ya habría
  // pisado la hora anterior y TODA apertura parecería una reanudación.
  const [esReanudacion] = useState(hayActividadReciente);
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

          // Se cierra si no hubo actividad reciente, o si hubo pero el rol
          // no tiene derecho a reanudar. `||` corta en el primero: sin
          // actividad reciente no se consulta el rol.
          const debeCerrar =
            Boolean(session) &&
            (!esReanudacion || ROLES_SIN_REANUDACION.includes(await leerRol(session.user.id)));

          if (debeCerrar) {
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

  // Mantiene al día la hora de última actividad mientras la app está
  // abierta. Además de los gestos, se anota al ocultar/volver a mostrar la
  // pestaña y al descargarla (`pagehide`): ese último registro es el que
  // se compara cuando el sistema descarta la pestaña y la persona vuelve
  // más tarde.
  useEffect(() => {
    let ultimoRegistro = 0;

    const registrarConLimite = () => {
      const ahora = Date.now();
      if (ahora - ultimoRegistro < INTERVALO_REGISTRO_MS) return;
      ultimoRegistro = ahora;
      registrarActividad();
    };

    EVENTOS_ACTIVIDAD.forEach((evento) =>
      window.addEventListener(evento, registrarConLimite, { passive: true })
    );
    document.addEventListener('visibilitychange', registrarActividad);
    window.addEventListener('pagehide', registrarActividad);

    return () => {
      EVENTOS_ACTIVIDAD.forEach((evento) => window.removeEventListener(evento, registrarConLimite));
      document.removeEventListener('visibilitychange', registrarActividad);
      window.removeEventListener('pagehide', registrarActividad);
    };
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