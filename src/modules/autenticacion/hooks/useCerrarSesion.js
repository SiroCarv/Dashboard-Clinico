// Orquesta el cierre de sesión: estado de carga para el botón, llamada al
// servidor (vía authService), limpieza local y redirección — en ese orden,
// pase lo que pase.
//
// Nota: Login.jsx, Registro.jsx, RegistroParticular.jsx y
// RecuperarPassword.jsx siguen llamando a `supabase.auth` directamente en
// vez de pasar por una capa de `service` — es una inconsistencia de
// patrón conocida (el módulo creció de forma incremental), documentada
// pero no corregida por no ser parte del alcance de ninguna historia
// todavía.
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export function useCerrarSesion() {
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const cerrarSesion = useCallback(async () => {
    if (cargando) return; // evita doble petición por doble clic

    setCargando(true);

    try {
      await authService.cerrarSesion();
    } catch (err) {
      // Si falla la red/servidor, no bloqueamos al usuario: igual limpiamos
      // localmente en el finally para no dejar el dispositivo abierto.
      console.error('No se pudo notificar el cierre de sesión al servidor:', err.message);
    } finally {
      localStorage.clear();
      sessionStorage.clear();

      // replace:true saca la ruta protegida del historial, así "Atrás"
      // del navegador no vuelve al Dashboard/Encuesta.
      navigate('/login', { replace: true });
    }
  }, [cargando, navigate]);

  return { cerrarSesion, cargando };
}
