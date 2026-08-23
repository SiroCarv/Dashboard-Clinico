// Pantalla intermedia entre Login y los dos flujos de registro (SCRUM-33,
// actualizada en SCRUM-46). El rol Consultante particular fue retirado
// del sistema y reemplazado por Docente — ver SCRUM-46/47/48.
//   "Soy estudiante"  -> /registro (código de institución)
//   "Soy docente"      -> /registro-docente (código de institución)
//
// OJO: "/registro-docente" todavía no está declarada en App.jsx — se
// agrega recién en SCRUM-47, que construye esa pantalla. Hasta entonces
// el botón navega a una ruta sin match (pantalla en blanco), a propósito,
// porque las historias se están haciendo en orden.
import { useNavigate, Link } from 'react-router-dom';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

export default function Bienvenida() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4 relative overflow-hidden">

      {/* Imagen de fondo semi-transparente (mismo patrón que Login/Registro/RecuperarPassword) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">

        <div className="mb-4">
          <Link
            to="/login"
            className="text-sm font-bold text-gray-500 hover:text-orange-700 transition-colors inline-flex items-center gap-1"
          >
            ← Volver atrás
          </Link>
        </div>

        <div className="mb-3 text-center">
          <p className="text-sm font-bold text-black">¿Qué tipo de perfil tienes?</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/registro')}
            className="w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide bg-orange-700 hover:bg-orange-800"
          >
            Soy estudiante
          </button>
          <button
            type="button"
            onClick={() => navigate('/registro-docente')}
            className="w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide bg-orange-700 hover:bg-orange-800"
          >
            Soy docente
          </button>
        </div>

        <div className="mt-6 text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-orange-700 hover:text-orange-800 font-bold transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}