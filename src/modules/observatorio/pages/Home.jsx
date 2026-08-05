import NavbarFlotante from '../components/NavbarFlotante';
import Carrusel from '../components/Carrusel';
import SeccionMisionVision from '../components/SeccionMisionVision';

// Página pública de bienvenida (Home) del Observatorio de Salud
// Mental. Reemplaza a Login como pantalla de entrada en "/" — Login
// sigue existiendo tal cual en "/login".
//
// Pendiente de confirmación de alcance con la Licenciada (esta
// pantalla corresponde a la Épica "Observatorio de Salud Mental",
// previamente descartada). Ver historia "Landing pública
// institucional" — no marcar como cerrada en Jira hasta confirmar.
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarFlotante />
      <Carrusel />
      <SeccionMisionVision />
    </div>
  );
}