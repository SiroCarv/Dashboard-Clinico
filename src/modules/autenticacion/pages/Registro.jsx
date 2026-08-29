// Registro de ESTUDIANTES (con institución). El registro de Consultantes
// particulares (sin institución) fue retirado del sistema — ver SCRUM-48.
//
// Entrada al formulario, dos formas:
//   - /registro/:codigo o /registro?codigo=... -> viene de un enlace que
//     la institución comparte con sus estudiantes. El código llega
//     precargado y se valida automáticamente (esCodigoDeEnlace).
//   - /registro a secas -> el estudiante escribe el código a mano.
//
// El código de institución se verifica en vivo contra Supabase con un
// debounce de 500ms (no en cada tecla) mientras el usuario escribe, y
// TODO el resto del formulario (curso, paralelo, turno, género, correo,
// contraseña) queda deshabilitado hasta que el código sea válido —así
// nunca se puede armar una cuenta a medias sin institución real detrás.
//
// La contraseña también se verifica en vivo (mismo patrón de debounce),
// contra bases de datos de contraseñas filtradas — ver
// useVerificacionPasswordFiltrada. Antes este chequeo solo corría al
// hacer submit, obligando a rehacer el formulario entero ante cada
// intento rechazado.
//
// Al enviar: crea el usuario en Supabase Auth y, en el mismo flujo,
// inserta su fila en `usuarios` con institucion_id ya resuelto.
// codigo_estudiante NUNCA se manda desde acá: lo asigna el trigger
// `asignar_codigo_estudiante()` en el servidor (ver migración SCRUM-33),
// para que el cliente no pueda inventarse ni repetir un código.
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { esPasswordFiltrada } from '../services/passwordSecurityService';
import { useVerificacionPasswordFiltrada } from '../hooks/useVerificacionPasswordFiltrada';

const OPCIONES_CURSO = [
  '1ro de Secundaria',
  '2do de Secundaria',
  '3ro de Secundaria',
  '4to de Secundaria',
  '5to de Secundaria',
  '6to de Secundaria',
];
const OPCIONES_PARALELO = ['A', 'B', 'C', 'D', 'E', 'F'];
const OPCIONES_TURNO = ['Mañana', 'Tarde'];
const OPCIONES_GENERO = ['Masculino', 'Femenino', 'Prefiero no decir'];

export default function Registro() {
  const { codigo: codigoDeRuta } = useParams();
  const [searchParams] = useSearchParams();
  const codigoDeQuery = searchParams.get('codigo');

  // Soporta tanto /registro/:codigo como /registro?codigo=...
  const codigoInicial = (codigoDeRuta || codigoDeQuery || '').trim().toUpperCase();

  const [codigoIngresado, setCodigoIngresado] = useState(codigoInicial);
  const [institucion, setInstitucion] = useState(null);
  const [buscandoCodigo, setBuscandoCodigo] = useState(false);
  const [validandoEnlace, setValidandoEnlace] = useState(!!codigoInicial);

  const esCodigoDeEnlace =
    !!codigoInicial && codigoIngresado.trim().toUpperCase() === codigoInicial;

  const primerRenderRef = useRef(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Campos de perfil diferenciado (SCRUM-33) — solo aplican al estudiante.
  const [curso, setCurso] = useState('');
  const [paralelo, setParalelo] = useState('');
  const [turno, setTurno] = useState('');
  const [genero, setGenero] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { verificandoPassword, passwordFiltrada, passwordConfirmadaSinFiltrar } =
    useVerificacionPasswordFiltrada(password);

  // Verificación en vivo del código de institución: espera 500ms desde la
  // última tecla (para no pegarle a Supabase en cada carácter) salvo la
  // primera vez que llega un código desde la URL, que se valida sin
  // demora (delay = 0) para no mostrar la pantalla de "verificando" más
  // tiempo del necesario.
  useEffect(() => {
    const codigoLimpio = codigoIngresado.trim().toUpperCase();

    if (!codigoLimpio) {
      // El reseteo visible (institucion/buscandoCodigo/validandoEnlace) ya
      // se hizo de forma inmediata en handleCodigoChange cuando el usuario
      // borra el campo. Acá solo queda marcar que ya pasó el primer render
      // para que la próxima búsqueda real no tenga el delay de 500ms.
      primerRenderRef.current = false;
      return;
    }

    const delay = primerRenderRef.current ? 0 : 500;
    primerRenderRef.current = false;

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
        setValidandoEnlace(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [codigoIngresado]);

  const handleCodigoChange = (e) => {
    const nuevoValor = e.target.value;
    setCodigoIngresado(nuevoValor);

    if (!nuevoValor.trim()) {
      // Código borrado: reseteamos de inmediato (sin esperar al debounce
      // del efecto, igual que antes) desde el propio evento.
      setInstitucion(null);
      setBuscandoCodigo(false);
      setValidandoEnlace(false);
    } else {
      // Feedback inmediato de "verificando" apenas el usuario escribe algo,
      // igual que antes — antes lo disparaba el efecto, ahora lo dispara
      // directamente el evento que realmente lo origina.
      setBuscandoCodigo(true);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!institucion) {
      setError('Ingresa un código de institución válido para continuar.');
      return;
    }

    // Respaldo en JS del required nativo de los 4 selects nuevos,
    // por si el navegador no lo aplica antes del submit.
    if (!curso || !paralelo || !turno || !genero) {
      setError('Por favor, completa curso, paralelo, turno y género.');
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

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica.');
      setLoading(false);
      return;
    }

    // Red de seguridad final: el chequeo en vivo
    // (useVerificacionPasswordFiltrada, mientras la persona escribía) ya
    // debería haber mantenido el botón deshabilitado si la contraseña
    // estaba filtrada. Se repite acá por si el envío ocurre antes de que
    // esa verificación termine (autocompletado del navegador, Enter muy
    // rápido, etc.). Sigue siendo la alternativa a la "Leaked Password
    // Protection" nativa de Supabase (requiere plan Pro — ver Security
    // Advisor).
    if (await esPasswordFiltrada(password)) {
      setError('Esta contraseña aparece en bases de datos de contraseñas filtradas. Por seguridad, elige una diferente.');
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

      // Vinculamos al paciente con la institución detectada. codigo_estudiante
      // NO se envía: lo asigna el trigger asignar_codigo_estudiante() en el
      // servidor (ver migración SCRUM-33), nunca el cliente.
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user.id,
            rol: 'paciente',
            institucion_id: institucion.id,
            email: cleanedEmail,
            curso,
            paralelo,
            turno,
            genero,
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

  if (validandoEnlace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <p className="text-gray-600 font-bold">Verificando enlace institucional...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4 relative overflow-hidden">

      {/* Imagen de fondo semi-transparente (placeholder temporal) */}
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
          <p className="text-gray-500 mt-2 font-medium">Registro de Estudiantes</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Código inválido: o bien vino de un enlace roto (URL), o el
            usuario ya escribió a mano un código que no corresponde a
            ninguna institución (mismo umbral de "ya se puede dar por mal
            escrito" que usa el indicador gris/rojo bajo el campo: más de
            3 caracteres). A propósito ya NO se muestra solo porque el
            campo esté vacío al entrar sin enlace — mostrarlo antes de que
            la persona escriba algo generaba una alarma sin necesidad. */}
        {!institucion && !buscandoCodigo && (esCodigoDeEnlace || codigoIngresado.trim().length > 3) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-center shadow-sm">
            <p className="font-bold">
              ⚠️ {esCodigoDeEnlace ? 'Enlace de registro inválido' : 'Código no encontrado'}
            </p>
            <p className="text-sm mt-1">
              {esCodigoDeEnlace
                ? 'El código de este enlace no es válido. Verifica con tu institución o corrígelo abajo.'
                : 'El código que escribiste no corresponde a ninguna institución registrada. Verifica que esté bien escrito.'}
            </p>
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
              ) : !esCodigoDeEnlace && codigoIngresado.trim().length > 3 ? (
                <span className="text-red-500 font-semibold">❌ Código no encontrado</span>
              ) : (
                <span className="text-gray-400">Pídelo a tu psicólogo si no tienes un enlace directo.</span>
              )}
            </div>
          </div>

          {institucion && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-center shadow-sm">
              <p className="text-sm">Estás registrándote en:</p>
              <p className="font-bold text-lg">{institucion.nombre}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Curso
              </label>
              <select
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona...</option>
                {OPCIONES_CURSO.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Paralelo
              </label>
              <select
                value={paralelo}
                onChange={(e) => setParalelo(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona...</option>
                {OPCIONES_PARALELO.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Turno
              </label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona...</option>
                {OPCIONES_TURNO.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Género
              </label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona...</option>
                {OPCIONES_GENERO.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            </div>
          </div>

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
                disabled={!institucion}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12 disabled:bg-gray-100 ${
                  passwordConfirmadaSinFiltrar ? 'border-green-500 bg-green-50' : 'border-gray-300'
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
            disabled={loading || !institucion || verificandoPassword || passwordFiltrada}
            className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
              loading || !institucion || verificandoPassword || passwordFiltrada
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

        <div className="mt-6 text-center space-y-1">
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