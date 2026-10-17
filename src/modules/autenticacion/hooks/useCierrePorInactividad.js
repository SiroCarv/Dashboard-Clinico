// Cierra la sesión automáticamente cuando la persona deja de usar la
// plataforma durante el tiempo que le corresponde a su rol (ver
// data/limitesInactividad.js: 15 min psicólogo/superadmin/docente, 30 min
// estudiante/persona particular). Se monta una sola vez para toda la app
// desde <CierrePorInactividad /> (App.jsx).
//
// Complementa a GuardianDeSesion.jsx, que solo actúa cuando se CIERRA y se
// vuelve a abrir la pestaña. Hasta ahora, una pestaña que se quedaba abierta
// y sin uso mantenía la sesión para siempre (Supabase renueva el acceso
// solo), y la "sesión única" solo se considera abandonada pasadas 12 horas.
//
// Qué cuenta como "usar la plataforma": tocar, hacer clic, escribir o
// desplazar la pantalla. NO cuenta que la pestaña simplemente se oculte o
// vuelva a mostrarse — por eso este hook lleva su propia marca
// (CLAVE_INTERACCION) y no reutiliza `ultima_actividad` de
// GuardianDeSesion, que sí se actualiza al volver a la pestaña y dejaría
// pasar a quien se sienta frente a una pantalla abandonada.
//
// El reloj parte de lo más reciente entre la última interacción y el
// último ingreso (`last_sign_in_at` de la sesión). Lo segundo evita que
// una marca vieja de una sesión anterior cierre la sesión recién iniciada.
//
// Con varias pestañas abiertas, la marca vive en localStorage: usar
// cualquiera de ellas mantiene viva a las demás. Si localStorage está
// bloqueado, se usa solo la marca en memoria de esta pestaña.
//
// Por qué se revisa tanto con un temporizador como al volver a la pestaña o
// al tocar la pantalla: los navegadores frenan los temporizadores de las
// pestañas ocultas (y de los equipos dormidos), así que el aviso del
// temporizador puede llegar tarde. Al volver, se compara con la hora real
// ANTES de registrar el gesto, así que una pantalla abandonada se cierra
// en el primer toque en vez de reactivarse.
//
// Limitación conocida: el cierre depende del reloj del dispositivo. Un
// equipo con el reloj adelantado más que el tiempo de su rol (15/30 min)
// cerraría la sesión recién iniciada.
//
// Exento: /restablecer-password, igual que en GuardianDeSesion.jsx — esa
// pantalla vive de la sesión temporal que abre el enlace del correo.
import { useEffect, useRef } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import {
  LIMITE_INACTIVIDAD_DEFECTO_MS,
  limiteInactividadParaRol,
} from '../data/limitesInactividad';
import { useCerrarSesion } from './useCerrarSesion';

const CLAVE_INTERACCION = 'ultima_interaccion';

// Gestos que cuentan como uso. Se escuchan en fase de captura porque el
// evento `scroll` no sube (bubble) desde los contenedores internos con
// desplazamiento propio, y de otra forma no se vería.
const EVENTOS_INTERACCION = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'];

// Máximo una escritura en localStorage cada tanto, aunque haya muchos
// gestos seguidos (desplazar genera decenas de eventos por segundo).
const INTERVALO_REGISTRO_MS = 15 * 1000;

// Cada cuánto se revisa si ya venció el tiempo, aunque no haya gestos.
const INTERVALO_REVISION_MS = 15 * 1000;

const RUTAS_EXENTAS = ['/restablecer-password'];

function leerInteraccion() {
  try {
    const valor = Number(localStorage.getItem(CLAVE_INTERACCION));
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  } catch {
    return null;
  }
}

function guardarInteraccion(milisegundos) {
  try {
    localStorage.setItem(CLAVE_INTERACCION, String(milisegundos));
  } catch {
    // Sin localStorage solo se pierde la coordinación entre pestañas; la
    // marca en memoria de esta pestaña sigue funcionando.
  }
}

function olvidarInteraccion() {
  try {
    localStorage.removeItem(CLAVE_INTERACCION);
  } catch {
    // Nada que hacer: sin localStorage tampoco hay marca que borrar.
  }
}

export function useCierrePorInactividad() {
  // useCerrarSesion cambia de identidad cuando cambia su estado de carga;
  // se guarda en una referencia para que el efecto de abajo (que debe
  // montarse una sola vez) siempre llame a la versión vigente.
  const { cerrarSesion } = useCerrarSesion();
  const cerrarSesionRef = useRef(cerrarSesion);

  useEffect(() => {
    cerrarSesionRef.current = cerrarSesion;
  }, [cerrarSesion]);

  useEffect(() => {
    let activo = true;
    let cerrando = false;
    // { userId, ingresoMs, limiteMs } mientras haya una sesión vigente.
    let sesion = null;
    let ultimaMemoria = 0;
    let ultimoRegistro = 0;

    async function cargarSesion(session) {
      if (!session?.user) {
        sesion = null;
        return;
      }
      // Mismo usuario (ej. renovación de token): no se reinicia nada.
      if (sesion?.userId === session.user.id) return;

      const userId = session.user.id;
      const ingreso = Date.parse(session.user.last_sign_in_at);
      // Math.min: si el reloj del dispositivo va ATRASADO respecto al
      // servidor, un ingreso "en el futuro" fijaría el reloj de
      // inactividad y cerraría la sesión de alguien que sí está usando
      // la plataforma.
      const ingresoMs = Number.isFinite(ingreso) ? Math.min(ingreso, Date.now()) : Date.now();

      sesion = { userId, ingresoMs, limiteMs: LIMITE_INACTIVIDAD_DEFECTO_MS };

      const { data } = await supabase.from('usuarios').select('rol').eq('id', userId).maybeSingle();
      if (activo && sesion?.userId === userId && data?.rol) {
        sesion.limiteMs = limiteInactividadParaRol(data.rol);
      }
    }

    function haVencido() {
      if (!sesion) return false;
      if (RUTAS_EXENTAS.includes(window.location.pathname)) return false;
      const referencia = Math.max(ultimaMemoria, leerInteraccion() ?? 0, sesion.ingresoMs);
      // Si el reloj retrocedió, la diferencia es negativa: no vence.
      return Date.now() - referencia > sesion.limiteMs;
    }

    async function expirar() {
      if (cerrando || !sesion) return;
      cerrando = true;
      sesion = null;
      try {
        // Mismo cierre que el botón "Cerrar sesión": libera la sesión
        // única, cierra en Supabase, limpia lo local (conservando los
        // borradores de formularios) y manda a Login.
        await cerrarSesionRef.current();
      } finally {
        cerrando = false;
      }
    }

    function comprobar() {
      if (haVencido()) expirar();
    }

    function alInteractuar() {
      if (!sesion) return;
      // Primero se comprueba, después se registra: si la sesión ya venció,
      // el gesto no la reactiva.
      if (haVencido()) {
        expirar();
        return;
      }
      const ahora = Date.now();
      ultimaMemoria = ahora;
      if (ahora - ultimoRegistro >= INTERVALO_REGISTRO_MS) {
        ultimoRegistro = ahora;
        guardarInteraccion(ahora);
      }
    }

    function alVolverAVerse() {
      if (document.visibilityState === 'visible') comprobar();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === 'SIGNED_OUT') {
        sesion = null;
        ultimaMemoria = 0;
        olvidarInteraccion();
        return;
      }
      if (cerrando) return;
      // Fuera del callback: supabase-js recomienda no esperar otras
      // llamadas a Supabase dentro de onAuthStateChange.
      setTimeout(() => {
        if (activo) cargarSesion(session);
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (activo && !cerrando) cargarSesion(data.session);
    });

    EVENTOS_INTERACCION.forEach((evento) =>
      window.addEventListener(evento, alInteractuar, { capture: true, passive: true })
    );
    document.addEventListener('visibilitychange', alVolverAVerse);
    window.addEventListener('focus', comprobar);
    window.addEventListener('pageshow', comprobar);
    const temporizador = setInterval(comprobar, INTERVALO_REVISION_MS);

    return () => {
      activo = false;
      subscription.unsubscribe();
      clearInterval(temporizador);
      EVENTOS_INTERACCION.forEach((evento) =>
        window.removeEventListener(evento, alInteractuar, { capture: true })
      );
      document.removeEventListener('visibilitychange', alVolverAVerse);
      window.removeEventListener('focus', comprobar);
      window.removeEventListener('pageshow', comprobar);
    };
  }, []);
}