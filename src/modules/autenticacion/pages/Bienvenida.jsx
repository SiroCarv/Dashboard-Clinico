import { useNavigate, Link } from 'react-router-dom';

export default function Bienvenida() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl">

        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-black">
            Observatorio de Salud Mental
          </h2>
          <p className="text-gray-500 mt-2 font-medium">UNIFRANZ</p>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm font-bold text-black mb-1">Misión</p>
            <p className="text-sm text-gray-600">
              Generar, analizar y difundir información científica y contextualizada sobre la salud mental en Santa Cruz y Bolivia, con el fin de orientar políticas públicas, fortalecer prácticas clínicas y promover el bienestar emocional en distintos entornos sociales.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-black mb-1">Visión</p>
            <p className="text-sm text-gray-600">
              Ser el principal referente regional en monitoreo, investigación, formación y articulación interinstitucional en temas de salud mental, contribuyendo a la construcción de una sociedad más saludable, informada y resiliente.
            </p>
          </div>
        </div>

        <div className="mb-3 text-center">
          <p className="text-sm font-bold text-black">¿Qué tipo de perfil tienes?</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/registro')}
            className="w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide bg-orange-500 hover:bg-orange-600"
          >
            Soy estudiante de colegio
          </button>
          <button
            type="button"
            onClick={() => navigate('/registro-particular')}
            className="w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide bg-orange-500 hover:bg-orange-600"
          >
            Soy Consultante
          </button>
        </div>

        <div className="mt-6 text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/" className="text-orange-500 hover:text-orange-600 font-bold transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}