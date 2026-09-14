// Barra de navegación fija (flotante) de la landing pública. Solo enlaza
// a rutas ya existentes (/login, /registro-nuevo) por href de React
// Router — nunca importa componentes de otro módulo, respetando el
// aislamiento entre dominios (DDD).
//
// "Persona Particular" RETIRADO de acá (historia "Acceso directo a
// Persona Particular desde Inicio de Sesión"): este enlace vivió acá
// desde el sprint "Persona Particular" (ver historial de comentarios en
// git), pero el cliente lo consideró poco visible en la landing pública
// y pidió moverlo a la pantalla de Login (Login.jsx), arriba a la
// derecha junto a "Volver al inicio" — mismo destino (/login-particular),
// solo cambia dónde vive.
import { Link } from 'react-router-dom';
import logo from '../../../shared/assets/logo.webp';

export default function NavbarFlotante() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src={logo} alt="Logo Observatorio de Salud Mental" className="h-25 md:h-28 w-auto" />
          <a
            href="#inicio"
            className="hidden sm:inline text-sm font-bold text-black uppercase tracking-wide hover:text-violet-400 transition-colors"
          >
            Inicio
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link to="/login" className="text-sm font-bold text-violet-400 hover:text-orange-800 transition-colors">
            Iniciar sesión
          </Link>
          <Link
            to="/registro-nuevo"
            className="bg-violet-400 hover:bg-orange-800 text-white text-sm font-bold py-2 px-4 rounded-md shadow-md transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  );
}