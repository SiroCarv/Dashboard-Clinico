// Guardián de rutas PRIVADAS (Encuesta, Dashboard, Panel Maestro, etc.).
// Envuelve a cada página protegida así: <RutaProtegida rolRequerido="psicologo"><Dashboard /></RutaProtegida>
//
// Qué hace, paso a paso:
//   1. Lee la sesión local de Supabase (rápido, no pega a la red).
//   2. Si hay sesión, busca en la tabla `usuarios` qué rol tiene esa
//      persona (la sesión de Auth no sabe nada de roles de negocio).
//   3. Si el rol NO coincide con `rolRequerido`, redirige a la propia
//      vista por defecto de ese rol (o a "/" si no hay sesión o el rol
//      es desconocido) — nunca deja pasar a una pantalla ajena.
//   4. Si coincide, renderiza `children` normalmente.
//
// El chequeo de rol vive acá y no en el backend porque el backend YA lo
// exige de verdad vía RLS (auth.uid() + rol) — esto es solo la capa de
// experiencia de usuario, para no dejar ver ni por un instante una
// pantalla que de todos modos le va a fallar cada consulta.
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { RUTA_POR_DEFECTO } from './rutasPorDefecto';

export default function RutaProtegida({ children, rolRequerido }) {
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarAcceso = async () => {
      // 1. Leemos la sesión local (Es instantáneo y evita rebotes)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setCargando(false);
        return;
      }

      // 2. Buscamos qué rol tiene este usuario en la base de datos
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

    verificarAcceso();
  }, []);

  // Pantalla de carga mientras lee la base de datos
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
        Verificando accesos...
      </div>
    );
  }

  // 3. Si el rol no coincide con el que requiere la pantalla, lo redireccionamos
  //    a SU propia vista por defecto (o a Login si no hay sesión/rol reconocido).
  if (rolUsuario !== rolRequerido) {
    return <Navigate to={RUTA_POR_DEFECTO[rolUsuario] || '/'} replace />;
  }

  // 4. Si todo está correcto, lo dejamos pasar a la pantalla
  return children;
}
