import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function RestablecerPassword() {
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para los ojitos
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (confirmarPassword.length > 0 && password !== confirmarPassword) {
      setErrorValidacion('Las contraseñas no coinciden');
    } else {
      setErrorValidacion('');
    }
  }, [password, confirmarPassword]);

  const manejarActualizacion = async (e) => {
    e.preventDefault();
    if (password !== confirmarPassword) return;
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setErrorValidacion('Error al actualizar. El enlace podría haber caducado.');
      setLoading(false);
    } else {
      // ¡SOLUCIÓN!: Cerramos la sesión "oculta" que abre Supabase con el enlace
      await supabase.auth.signOut();
      
      navigate('/login', { 
        state: { mensajeRegistro: '¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.' } 
      });
    }
  };

  const contrasenasNoCoinciden = errorValidacion === 'Las contraseñas no coinciden';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black">
            Nueva Clave
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Plataforma Diagnóstica</p>
        </div>
        
        {errorValidacion && errorValidacion !== 'Las contraseñas no coinciden' && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {errorValidacion}
          </div>
        )}

        <form onSubmit={manejarActualizacion} className="space-y-6">
          {/* Input Nueva Contraseña */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800 pr-12"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors"
                tabIndex="-1"
              >
                {mostrarPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Input Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                required
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className={`w-full px-4 py-3 border rounded-md outline-none transition-all text-gray-800 pr-12 ${
                  contrasenasNoCoinciden 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors"
                tabIndex="-1"
              >
                {mostrarConfirmar ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            {contrasenasNoCoinciden && (
              <p className="mt-2 text-sm text-red-600 font-bold">{errorValidacion}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || contrasenasNoCoinciden || password.length === 0}
            className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
              (loading || contrasenasNoCoinciden || password.length === 0) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Guardando...
              </span>
            ) : (
              'Guardar contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}