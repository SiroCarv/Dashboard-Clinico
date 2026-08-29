// Registro de DOCENTES (SCRUM-47). Reutiliza el mismo patrón de
// verificación en vivo del código de institución que ya usa Registro.jsx
// (estudiantes), pero simplificado: sin curso/paralelo/turno/género (no
// aplican a un docente) y sin soporte de enlace precargado
// (/registro/:codigo) — esta historia solo contempla que el docente
// escriba el código a mano, llegando desde Bienvenida ("Soy docente").
//
// Requiere que el CHECK de `usuarios.rol` ya incluya 'docente' (ver
// migración entregada junto con este archivo) — sin eso, el INSERT
// final falla en la base de datos aunque el formulario se vea bien.
//
// Pendiente FUERA de esta historia: `rutasPorDefecto.js` todavía no
// tiene una vista para 'docente', así que la cuenta queda creada pero
// el docente no podrá entrar a ningún panel hasta que exista esa
// historia futura. Login.jsx ya contempla ese caso mostrando "Tu cuenta
// no tiene un rol válido asignado" en vez de fallar en silencio, así
// que no es un bug de esta entrega.
//
// Requisitos de composición (mayúscula/minúscula/número/símbolo + 8
// caracteres mínimo): política única para TODA la plataforma, ver
// shared/utils/validarPasswordSegura.js. Es la única validación de
// contraseña de esta pantalla — el chequeo contra bases de datos de
// contraseñas filtradas (HaveIBeenPwned) que existía antes se retiró
// por decisión del cliente, al considerar suficiente esta política de
// composición + longitud mínima.
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { validarPasswordSegura, LONGITUD_MINIMA_PASSWORD } from '../../../shared/utils/validarPasswordSegura';
import { ChecklistPasswordSegura } from '../../../shared/components/ChecklistPasswordSegura';

export default function RegistroDocente() {
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [institucion, setInstitucion] = useState(null);
  const [buscandoCodigo, setBuscandoCodigo] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validacionPassword = useMemo(() => validarPasswordSegura(password), [password]);

  // Verificación en vivo del código de institución: espera 500ms desde
  // la última tecla, igual que Registro.jsx (sin el caso especial de
  // "código precargado por URL" porque acá no existe esa entrada).
  useEffect(() => {
    const codigoLimpio = codigoIngresado.trim().toUpperCase();

    if (!codigoLimpio) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const { data, error: supaError } = await supabase
          .from('instituciones')
          .select('id, nombre')
          .eq('codigo_registro', codigoLimpio)
          .maybeSingle();

        if (supaError) {
          console.error('Error al verificar el código de institución:', supaError.message);
        }

        setInstitucion(data || null);
      } catch (err) {
        console.error('Error inesperado al verificar el código:', err.message);
        setInstitucion(null);
      } finally {
        setBuscandoCodigo(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [codigoIngresado]);

  const handleCodigoChange = (e) => {
    const nuevoValor = e.target.value;
    setCodigoIngresado(nuevoValor);

    if (!nuevoValor.trim()) {
      setInstitucion(null);
      setBuscandoCodigo(false);
    } else {
      setBuscandoCodigo(true);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!institucion) {
      setError('Ingresa un código de institución válido para continuar.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanedEmail = email.trim().replace(/\s+/g, '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanedEmail)) {
      setError('Por favor, ingresa un correo electrónico válido (ej. usuario@gmail.com).');
      setLoading(false);
      return;
    }

    if (!validarPasswordSegura(password).esValida) {
      setError(
        `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres e incluir mayúscula, minúscula, número y símbolo.`
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica.');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanedEmail,
        password: password,
      });

      if (authError) {
        const esCorreoDuplicado =
          authError.message?.toLowerCase().includes('already registered') ||
          authError.code === 'user_already_exists';

        if (esCorreoDuplicado) {
          throw new Error('Este correo ya está registrado');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Error al crear el usuario. Intente nuevamente.');
      }

      const { error: userError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user.id,
            rol: 'docente',
            institucion_id: institucion.id,
            email: cleanedEmail,
          },
        ]);

      if (userError) throw userError;

      navigate('/login', {
        state: { mensajeRegistro: '¡Cuenta registrada exitosamente! Ya puedes iniciar sesión.' },
      });
    } catch (err) {
      console.error('Error en el registro:', err.message);
      setError(err.message === 'Este correo ya está registrado' ? err.message : 'Ocurrió un error al registrar la cuenta.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4 relative overflow-hidden">

      {/* Imagen de fondo semi-transparente (mismo patrón que Login/Registro/RecuperarPassword) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4 text-sm font-bold">
          <Link
            to="/registro-nuevo"
            className="text-gray-500 hover:text-orange-700 transition-colors inline-flex items-center gap-1"
          >
            ← Atrás
          </Link>
          <Link
            to="/login"
            className="text-gray-500 hover:text-orange-700 transition-colors inline-flex items-center gap-1"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-black">
            Crear Cuenta
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Registro de Docentes</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-6">

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Código de Institución
            </label>
            <input
              type="text"
              value={codigoIngresado}
              onChange={handleCodigoChange}
              placeholder="Ej. UNI-4A9B"
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 uppercase ${
                institucion ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
            />
            <div className="h-5 mt-1 text-xs">
              {buscandoCodigo ? (
                <span className="text-gray-500 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verificando código...
                </span>
              ) : institucion ? (
                <span className="text-green-600 font-semibold">✓ Institución encontrada</span>
              ) : codigoIngresado.trim().length > 0 ? (
                <span className="text-red-500 font-semibold">❌ Código no encontrado</span>
              ) : (
                <span className="text-gray-400">Pídelo a la administración de tu institución.</span>
              )}
            </div>
          </div>

          {institucion && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-center shadow-sm">
              <p className="text-sm">Estás registrándote en:</p>
              <p className="font-bold text-lg">{institucion.nombre}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!institucion}
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Debe incluir un dominio válido (ej. .com, .es)"
              placeholder="usuario@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={LONGITUD_MINIMA_PASSWORD}
                disabled={!institucion}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12 disabled:bg-gray-100 ${
                  validacionPassword.esValida ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!institucion}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors disabled:opacity-50"
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                )}
              </button>
            </div>
            {password.length > 0 && <ChecklistPasswordSegura requisitos={validacionPassword.requisitos} />}
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!institucion}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12 disabled:bg-gray-100 ${
                  confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={!institucion}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors disabled:opacity-50"
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1 font-semibold">Las contraseñas no coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !institucion || !validacionPassword.esValida}
            className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
              loading || !institucion || !validacionPassword.esValida
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-700 hover:bg-orange-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Procesando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
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