// Inicio de sesión de PERSONA PARTICULAR: carnet + PIN, sin correo.
// Mismo patrón visual y de "sesión única" que Login.jsx (ver comentario
// completo ahí sobre el RPC iniciar_sesion_unica/forzar_sesion_unica),
// pero con dos diferencias deliberadas:
//   - El formulario pide Carnet de Identidad + PIN, nunca correo.
//   - NO existe ningún link de "¿Olvidaste tu PIN?": al no haber correo
//     registrado, no hay ningún canal para enviar un enlace de
//     recuperación. Si una persona particular olvida su PIN, hoy no
//     tiene forma de resolverlo dentro de la plataforma (documentado
//     como decisión explícita del cliente, no como un olvido).
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';
import { RUTA_POR_DEFECTO } from '../../../core/security/rutasPorDefecto';
import { personasParticularesService, LONGITUD_PIN } from '../services/personasParticularesService';
import logo from '../../../shared/assets/logo.webp';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';

export default function LoginPersonaParticular() {
  const [carnetIdentidad, setCarnetIdentidad] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [sesionBloqueada, setSesionBloqueada] = useState(false);
  const [forzando, setForzando] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [mensajeExito, setMensajeExito] = useState(() => location.state?.mensajeRegistro || '');
  const [desvanecer, setDesvanecer] = useState(false);

  useEffect(() => {
    if (!mensajeExito) return;
    window.history.replaceState({}, document.title);
    const fadeTimer = setTimeout(() => setDesvanecer(true), 5000);
    const removeTimer = setTimeout(() => {
      setMensajeExito('');
      setDesvanecer(false);
    }, 6000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rutaDestino = RUTA_POR_DEFECTO.persona_particular;

  const handlePinChange = (e) => {
    setPin(e.target.value.replace(/\D/g, '').slice(0, LONGITUD_PIN));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { sesionConcedida } = await personasParticularesService.iniciarSesion({ carnetIdentidad, pin });

      if (!sesionConcedida) {
        setSesionBloqueada(true);
        return;
      }

      navigate(rutaDestino, { replace: true });
    } catch (err) {
      console.error('Error de login:', err.message);
      setError(err.message || 'Carnet de identidad o PIN incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleForzarSesion = async () => {
    setForzando(true);
    setError('');
    try {
      const { error: forzarError } = await supabase.rpc('forzar_sesion_unica');
      if (forzarError) throw forzarError;
      navigate(rutaDestino, { replace: true });
    } catch (err) {
      console.error('Error al forzar sesión única:', err.message);
      setError('No se pudo cerrar la sesión anterior. Intenta nuevamente.');
      setSesionBloqueada(false);
    } finally {
      setForzando(false);
    }
  };

  const handleCancelarForzado = async () => {
    setSesionBloqueada(false);
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-violet-50 p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      {mensajeExito && (
        <div
          className={`relative z-10 max-w-md w-full mb-4 p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-lg text-center font-bold transition-opacity duration-1000 ease-in-out ${
            desvanecer ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {mensajeExito}
        </div>
      )}

      <div className="relative z-10 max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">
        <div className="mb-4">
          <Link to="/" className="text-sm font-bold text-gray-500 hover:text-orange-700 transition-colors inline-flex items-center gap-1">
            ← Volver al inicio
          </Link>
        </div>

        <div className="text-center mb-8">
          <img src={logo} alt="Logo Plataforma Diagnóstica" className="mx-auto w-50 h-auto relative z-10 -mb-15 -mt-15" />
          <h2 className="text-3xl font-extrabold text-black relative z-20">Iniciar Sesión</h2>
          <p className="text-gray-500 mt-2 font-medium">Persona Particular</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {sesionBloqueada ? (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
              <p className="font-bold">⚠️ Esta cuenta ya tiene una sesión activa</p>
              <p className="text-sm mt-1">
                Puede ser otra persona usando esta misma computadora. Si sos vos, podés cerrar esa sesión y continuar acá.
              </p>
            </div>

            <button
              type="button"
              onClick={handleForzarSesion}
              disabled={forzando}
              className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
                forzando ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-700 hover:bg-orange-800'
              }`}
            >
              {forzando ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Cerrando la otra sesión...
                </span>
              ) : (
                'Cerrar esa sesión y continuar aquí'
              )}
            </button>

            <button
              type="button"
              onClick={handleCancelarForzado}
              disabled={forzando}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Carnet de Identidad</label>
              <input
                type="text"
                value={carnetIdentidad}
                onChange={(e) => setCarnetIdentidad(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">PIN</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={pin}
                  onChange={handlePinChange}
                  required
                  placeholder="••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors"
                  tabIndex="-1"
                >
                  {showPin ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* A propósito, NO hay ningún link "¿Olvidaste tu PIN?" acá —
                ver comentario de archivo. */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-700 hover:bg-orange-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro-particular" className="text-orange-700 hover:text-orange-800 font-bold transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}