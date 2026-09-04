// Página de respaldo para cualquier URL que no coincida con ninguna ruta
// definida (se engancha con el comodín "*" al final de <Routes> en
// App.jsx). Antes de esto, entrar a una URL inválida -- un typo, un
// enlace viejo, o por ejemplo /registro-docente/:codigo, que todavía no
// existe como ruta (ver comentario en RegistroDocente.jsx: quedó
// deliberadamente fuera de alcance en SCRUM-47) -- renderizaba una
// pantalla en blanco sin ningún aviso.
//
// Vive en shared/ porque no pertenece a ningún dominio de negocio: es un
// fallback genérico de enrutamiento de toda la app, no una pantalla de
// ningún módulo en particular.
import { useNavigate } from 'react-router-dom';
import { FONDO_PLATAFORMA } from '../assets/fondoPlataforma';

export default function NoEncontrado() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4 relative overflow-hidden">

      {/* Imagen de fondo semi-transparente (mismo patrón que el resto de
          las pantallas públicas: Login/Registro/RecuperarPassword/Bienvenida) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl text-center">

        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-black">Página no encontrada</h2>
          <p className="text-gray-500 mt-2 font-medium">
            El enlace que abriste no existe o ya no está disponible.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide bg-orange-700 hover:bg-orange-800"
        >
          Volver al inicio
        </button>

      </div>
    </div>
  );
}