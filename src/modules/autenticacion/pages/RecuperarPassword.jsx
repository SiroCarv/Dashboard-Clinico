import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  // NUEVO: Agregamos un estado de error
  const [error, setError] = useState(''); 

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    setError('');

    const correoLimpio = correo.trim().replace(/\s+/g, '');

    // NUEVA VALIDACIÓN: Regex para asegurar que el correo tenga dominio
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoLimpio)) {
      setError('Por favor, ingresa un correo electrónico válido (ej. usuario@dominio.com).');
      setLoading(false);
      return;
    }

    await supabase.auth.resetPasswordForEmail(correoLimpio, {
      redirectTo: `${window.location.origin}/restablecer-password`,
    });

    setMensaje('Si el correo está registrado, recibirás un enlace de recuperación en breve.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black">
            Recuperar
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Contraseña</p>
        </div>

        {/* Mostramos el error si existe */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {mensaje ? (
          <div className="mb-4 p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-sm text-center font-bold">
            {mensaje}
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                title="Debe incluir un dominio válido (ej. .com, .es)"
                placeholder="usuario@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Enviando...
                </span>
              ) : (
                'Enviar enlace'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center pt-4 border-t border-gray-200">
          <Link to="/login" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
            Volver al inicio de sesión
          </Link>
        </div>
        
      </div>
    </div>
  );
}