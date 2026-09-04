// Guardián inverso a RutaProtegida: envuelve las pantallas PÚBLICAS
// (Login, Registro, RecuperarPassword) para que alguien que YA
// tiene una sesión válida no se quede viéndolas — sea porque escribió la
// URL a mano, volvió por un bookmark, o usó el botón "Atrás" del
// navegador sin haber cerrado sesión antes.
//
// Home ("/") queda fuera de esta capa a propósito, igual que antes de
// SCRUM-46: es la única pantalla que debe verse siempre de inmediato,
// incluso para alguien con sesión activa (ver GuardianDeSesion.jsx).
//
// Si detecta sesión activa y conoce el rol, redirige directo a la vista
// por defecto de ese rol (mismo mapa que usa RutaProtegida). Si el rol no
// se pudo determinar (por ejemplo, un error de red al consultar
// `usuarios`), deja pasar a la pantalla pública en vez de forzar una
// redirección a ciegas: eso evita un loop de redirects contra esta misma
// ruta, y el peor caso posible es inofensivo (ver el login estando ya
// logueado).
//
// Caso particular — sesión huérfana: si la sesión local corresponde a un
// usuario que ya no existe en `usuarios` (cuenta borrada, o un registro
// que nunca llegó a completarse), Supabase devuelve el error "PGRST116"
// (0 filas para `.single()`). Ahí no tiene sentido "dejar pasar y
// reintentar en cada carga": cerramos esa sesión fantasma con signOut()
// para que no siga fallando la misma consulta una y otra vez.
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
        if (error.code === 'PGRST116') {
          console.warn('Sesión sin usuario asociado, cerrando sesión local.');
          await supabase.auth.signOut();
          setHaySesion(false);
          setCargando(false);
          return;
        }
        console.error('Error al verificar rol:', error.message);
      }

      if (data) {
        setRolUsuario(data.rol);
      }

      setCargando(false);
    };

    verificarSesion();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
        Verificando accesos...
      </div>
    );
  }

  if (haySesion && RUTA_POR_DEFECTO[rolUsuario]) {
    return <Navigate to={RUTA_POR_DEFECTO[rolUsuario]} replace />;
  }

  return children;
}