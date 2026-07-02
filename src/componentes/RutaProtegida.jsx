import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function RutaProtegida({ children, rolRequerido }) {
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarAcceso = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCargando(false);
        return;
      }

      const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (data) setRolUsuario(data.rol);
      setCargando(false);
    };

    verificarAcceso();
  }, []);

  if (cargando) return <div className="min-h-screen flex items-center justify-center">Verificando accesos...</div>;

  // Si no hay usuario o el rol no coincide, lo expulsa al inicio o a su ruta permitida
  if (rolUsuario !== rolRequerido) {
    return <Navigate to={rolUsuario === 'paciente' ? '/encuesta' : '/'} replace />;
  }

  // Si todo está bien, lo deja pasar
  return children;
}