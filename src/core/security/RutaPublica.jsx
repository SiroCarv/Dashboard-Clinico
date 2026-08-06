// Guardián inverso a RutaProtegida: envuelve las pantallas PÚBLICAS
// (Login, Registro, RecuperarPassword, Home) para que alguien que YA
// tiene una sesión válida no se quede viéndolas — sea porque escribió la
// URL a mano, volvió por un bookmark, o usó el botón "Atrás" del
// navegador sin haber cerrado sesión antes.
//
// Si detecta sesión activa y conoce el rol, redirige directo a la vista
// por defecto de ese rol (mismo mapa que usa RutaProtegida). Si el rol no
// se pudo determinar (por ejemplo, un error de red al consultar
// `usuarios`), deja pasar a la pantalla pública en vez de forzar una
// redirección a ciegas: eso evita un loop de redirects contra esta misma
// ruta, y el peor caso posible es inofensivo (ver el login estando ya
// logueado).
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { RUTA_POR_DEFECTO } from './rutasPorDefecto';

export default function RutaPublica({ children }) {
  const [rolUsuario, setRolUsuario] = useState(null);
  const [haySesion, setHaySesion] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setCargando(false);
        return;
      }

      setHaySesion(true);

      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error al verificar rol:', error.message);
      }

      if (data) {
        setRolUsuario(data.rol);
      }

      setCargando(false);
    };

    verificarSesion();
  }, []);

  // Misma pantalla de carga que usa RutaProtegida, para que no haya parpadeo visual
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
        Verificando accesos...
      </div>
    );
  }

  // Solo redirigimos si hay sesión Y conocemos a dónde mandarlo.
  if (haySesion && RUTA_POR_DEFECTO[rolUsuario]) {
    return <Navigate to={RUTA_POR_DEFECTO[rolUsuario]} replace />;
  }

  return children;
}
