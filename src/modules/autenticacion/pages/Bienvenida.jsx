import { useNavigate, Link } from 'react-router-dom';

export default function Bienvenida() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4">
      <div className="max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">

        <div className="mb-4">
          <Link
            to="/"
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
            Soy estudiante de colegio
          </button>
          <button
            type="button"
            onClick={() => navigate('/registro-particular')}
            className="w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide bg-orange-700 hover:bg-orange-800"
          >
            Soy Consultante
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