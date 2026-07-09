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