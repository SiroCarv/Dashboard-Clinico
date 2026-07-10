import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { RUTA_POR_DEFECTO } from './rutasPorDefecto';

// Guard inverso a RutaProtegida: protege las pantallas PÚBLICAS
// (login, registro, recuperar-password) para que un usuario que YA
// tiene una sesión válida no pueda quedarse viéndolas —sea por URL
// escrita a mano, un bookmark, o el botón "Atrás" del navegador—
// sin haber cerrado sesión explícitamente.
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
  // Si el rol no se pudo determinar (error de red, fila inexistente
  // en "usuarios", etc.), dejamos pasar a la pantalla pública en vez
  // de forzar una redirección a ciegas: evita un loop de redirects
  // contra esta misma ruta y el peor caso posible es inofensivo
  // (ver el formulario de login estando ya logueado).
  if (haySesion && RUTA_POR_DEFECTO[rolUsuario]) {
    return <Navigate to={RUTA_POR_DEFECTO[rolUsuario]} replace />;
  }

  return children;
}