// Paso 2 del flujo de recuperación: acá se llega SOLO desde el enlace que
// manda RecuperarPassword.jsx por correo. Ese enlace abre una sesión
// "oculta" de Supabase automáticamente (por eso esta ruta va SIN
// <RutaPublica> en App.jsx: envolverla la mandaría de vuelta a Login
// antes de poder mostrar el formulario), suficiente para llamar a
// `auth.updateUser({ password })` pero sin ser una sesión real de
// aplicación.
//
// Historia "Cierre de sesiones antiguas al cambiar contraseña": una vez
// guardada la nueva contraseña, hay que dejar afuera cualquier otro
// dispositivo donde la cuenta siguiera con sesión abierta. El orden de
// los siguientes pasos importa:
//
//   1. `cerrar_sesion_unica()` — libera el candado de "sesión única"
//      (historia SCRUM-41) de ESTA cuenta. Se hace ANTES de cerrar la
//      sesión oculta porque la función necesita `auth.uid()` para saber
//      a quién liberar (mismo orden que en `authService.cerrarSesion`).
//      Si no se hiciera esto, la persona podría quedar bloqueada al
//      intentar loguearse con su contraseña nueva, viendo el mensaje
//      "Esta cuenta ya tiene una sesión activa" si algún otro
//      dispositivo había dejado el candado puesto hace menos de 12 horas.
//   2. `auth.signOut({ scope: 'global' })` — se deja el scope explícito
//      a propósito (en vez de confiar en el default de la librería) para
//      que quede documentado que esto es lo que realmente cierra la
//      cuenta en TODOS los dispositivos donde estuviera abierta, no solo
//      en esta pestaña oculta. Ojo: los tokens de acceso que esos otros
//      dispositivos ya tengan en memoria siguen siendo válidos hasta que
//      expiren por su cuenta (Supabase no permite invalidarlos al
//      instante) — pero ya no van a poder renovar la sesión ni volver a
//      autenticarse con la contraseña vieja.
//   3. Recién ahí se manda a /login para que entre con su contraseña
//      nueva.
// La contraseña se verifica en vivo (mismo patrón de debounce que el
// código de institución en Registro.jsx) contra bases de datos de
// contraseñas filtradas — ver useVerificacionPasswordFiltrada,
// compartido con Registro.jsx y RegistroDocente.jsx.
//
// Requisitos de composición (mayúscula/minúscula/número/símbolo + 8
// caracteres mínimo): misma política única de toda la plataforma, ver
// shared/utils/validarPasswordSegura.js. Es una validación distinta e
// independiente del chequeo de contraseñas filtradas de arriba — ambas
// deben pasar para poder guardar la nueva contraseña.
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { esPasswordFiltrada } from '../services/passwordSecurityService';
import { useVerificacionPasswordFiltrada } from '../hooks/useVerificacionPasswordFiltrada';
import { validarPasswordSegura, LONGITUD_MINIMA_PASSWORD } from '../../../shared/utils/validarPasswordSegura';
import { ChecklistPasswordSegura } from '../../../shared/components/ChecklistPasswordSegura';

export default function RestablecerPassword() {
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  // Error real de envío (falla de Supabase al actualizar), separado de la
  // validación de coincidencia: esa se calcula directo en cada render, no
  // necesita su propio estado ni un efecto que la sincronice.
  const [errorSubmit, setErrorSubmit] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para los ojitos
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  
  const navigate = useNavigate();

  const contrasenasNoCoinciden = confirmarPassword.length > 0 && password !== confirmarPassword;

  const { verificandoPassword, passwordFiltrada, passwordConfirmadaSinFiltrar } =
    useVerificacionPasswordFiltrada(password);

  const validacionPassword = useMemo(() => validarPasswordSegura(password), [password]);

  const manejarActualizacion = async (e) => {
    e.preventDefault();
    if (password !== confirmarPassword) return;

    if (!validacionPassword.esValida) {
      setErrorSubmit(
        `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres e incluir mayúscula, minúscula, número y símbolo.`
      );
      return;
    }

    setLoading(true);

    // Red de seguridad final: el chequeo en vivo
    // (useVerificacionPasswordFiltrada, mientras la persona escribía) ya
    // debería haber mantenido el botón deshabilitado si la contraseña
    // estaba filtrada. Se repite acá por si el envío ocurre antes de que
    // esa verificación termine (autocompletado del navegador, Enter muy
    // rápido, etc.). Sigue siendo la alternativa a la "Leaked Password
    // Protection" nativa de Supabase (requiere plan Pro — ver Security
    // Advisor).
    if (await esPasswordFiltrada(password)) {
      setErrorSubmit('Esta contraseña aparece en bases de datos de contraseñas filtradas. Por seguridad, elige una diferente.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setErrorSubmit('Error al actualizar. El enlace podría haber caducado.');
      setLoading(false);
    } else {
      // Libera el candado de "sesión única" de esta cuenta ANTES de
      // cerrar la sesión oculta (mientras `auth.uid()` todavía resuelve
      // quién es). Si esto llegara a fallar, no cortamos el flujo: es
      // preferible que la persona pueda entrar con su contraseña nueva
      // y, en el peor caso, tenga que esperar el timeout de 12 horas de
      // la sesión única, a que quede trabada en mitad del
      // restablecimiento por el error de un paso secundario.
      try {
        await supabase.rpc('cerrar_sesion_unica');
      } catch (err) {
        console.error('No se pudo liberar la sesión única al restablecer la contraseña:', err.message);
      }

      // scope: 'global' explícito (ver comentario de cabecera): cierra
      // esta sesión oculta Y revoca la cuenta en cualquier otro
      // dispositivo donde siguiera abierta.
      await supabase.auth.signOut({ scope: 'global' });
      
      navigate('/login', { 
        state: { mensajeRegistro: '¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.' } 
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-violet-50 p-4 relative overflow-hidden">

      {/* Imagen de fondo semi-transparente (placeholder temporal) */}
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
            ← Volver al inicio de sesión
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black">
            Nueva Clave
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Plataforma Diagnóstica</p>
        </div>
        
        {errorSubmit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {errorSubmit}
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
                minLength={LONGITUD_MINIMA_PASSWORD}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Mínimo ${LONGITUD_MINIMA_PASSWORD} caracteres`}
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12 ${
                  passwordConfirmadaSinFiltrar ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors"
                tabIndex="-1"
              >
                {mostrarPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            {password.length > 0 && <ChecklistPasswordSegura requisitos={validacionPassword.requisitos} />}
            <div className="h-5 mt-1 text-xs">
              {verificandoPassword ? (
                <span className="text-gray-500 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verificando contraseña...
                </span>
              ) : passwordFiltrada ? (
                <span className="text-red-500 font-semibold">❌ Esta contraseña está filtrada. Elige otra.</span>
              ) : passwordConfirmadaSinFiltrar ? (
                <span className="text-green-600 font-semibold">✓ No aparece en bases de datos filtradas</span>
              ) : (
                <span className="text-gray-400">Evita contraseñas muy comunes o ya usadas en otros sitios.</span>
              )}
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
                    : 'border-gray-300 focus:ring-2 focus:ring-orange-700 focus:border-orange-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors"
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
              <p className="mt-2 text-sm text-red-600 font-bold">Las contraseñas no coinciden</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={
              loading ||
              contrasenasNoCoinciden ||
              password.length === 0 ||
              verificandoPassword ||
              passwordFiltrada ||
              !validacionPassword.esValida
            }
            className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
              (loading ||
                contrasenasNoCoinciden ||
                password.length === 0 ||
                verificandoPassword ||
                passwordFiltrada ||
                !validacionPassword.esValida)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-700 hover:bg-orange-800'
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