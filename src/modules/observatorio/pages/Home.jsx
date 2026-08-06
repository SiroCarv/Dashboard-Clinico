// Página pública de bienvenida (Home) del Observatorio de Salud Mental.
// Reemplaza a Login como pantalla de entrada en "/" — Login sigue
// existiendo tal cual en "/login". Compone las 3 secciones de la landing
// en orden: barra flotante, carrusel de imágenes, y misión/visión.
//
// Pendiente de confirmación final de alcance con la Licenciada (Épica
// "Observatorio de Salud Mental").
import NavbarFlotante from '../components/NavbarFlotante';
import Carrusel from '../components/Carrusel';
import SeccionMisionVision from '../components/SeccionMisionVision';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarFlotante />
      <Carrusel />
      <SeccionMisionVision />
    </div>
  );
}
