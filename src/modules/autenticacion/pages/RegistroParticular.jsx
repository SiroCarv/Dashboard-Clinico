// Registro de CONSULTANTES particulares (sin institución) — historia
// SCRUM-29. Componente propio, separado de Registro.jsx a propósito para
// no meter lógica condicional de "¿tiene institución o no?" dentro del
// flujo institucional ya aprobado por el cliente.
//
// Diferencias clave contra Registro.jsx:
//   - No pide código de institución: el formulario está habilitado desde
//     el inicio.
//   - Pide teléfono (contacto ante una emergencia clínica, requisito del
//     cliente) en vez de curso/paralelo/turno.
//   - Pide elegir un psicólogo designado (obligatorio) de una lista
//     pública de cuentas ya registradas — es lo que permite que ese
//     psicólogo vea después los resultados de este Consultante (ver
//     política "usuarios_select_psicologo_pacientes" en la migración
//     011). Sin esto, el registro funcionaba pero el Consultante
//     quedaba invisible para todo psicólogo (ver nota histórica que
//     tenía este archivo, ya resuelta).
//   - Inserta institucion_id = NULL en `usuarios` a propósito. Por eso
//     esta cuenta NUNCA recibe codigo_estudiante: el trigger
//     asignar_codigo_estudiante() solo actúa cuando institucion_id no es
//     nulo.
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import { psicologosService } from '../../psicologos';
import { esPasswordFiltrada } from '../services/passwordSecurityService';

const OPCIONES_GENERO = ['Masculino', 'Femenino', 'Prefiero no decir'];

export default function RegistroParticular() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [genero, setGenero] = useState('');
  const [psicologoAsignadoId, setPsicologoAsignadoId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lista de psicólogos para el selector. Se carga una sola vez al
  // entrar al formulario, antes de que exista cualquier sesión — por
  // eso viene de la vista pública psicologos_publico y no de `usuarios`.
  const [psicologos, setPsicologos] = useState([]);
  const [cargandoPsicologos, setCargandoPsicologos] = useState(true);
  const [errorPsicologos, setErrorPsicologos] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    psicologosService
      .listarPublico()
      .then((data) => {
        if (activo) setPsicologos(data);
      })
      .catch((err) => {
        console.error('Error al cargar la lista de psicólogos:', err.message);
        if (activo) setErrorPsicologos('No se pudo cargar la lista de psicólogos. Recarga la página.');
      })
      .finally(() => {
        if (activo) setCargandoPsicologos(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleRegistro = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    // Nombre: solo recortamos espacios en los extremos (no colapsamos
    // espacios internos, porque un nombre completo los necesita).
    // Teléfono ya no puede traer nada más que dígitos —el input filtra
    // cualquier otro carácter a medida que se escribe—, así que acá el
    // trim() es solo un resguardo por si en algún momento se completa el
    // valor desde otro lado (autocompletado, etc.) sin pasar por ese filtro.
    const cleanedNombre = nombre.trim();
    const cleanedTelefono = telefono.trim();
    const cleanedEmail = email.trim().replace(/\s+/g, '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanedNombre || !cleanedTelefono) {
      setError('Por favor, completa tu nombre y teléfono de contacto.');
      setLoading(false);
      return;
    }

    if (!genero) {
      setError('Por favor, selecciona tu género.');
      setLoading(false);
      return;
    }

    if (!psicologoAsignadoId) {
      setError('Por favor, selecciona un psicólogo designado.');
      setLoading(false);
      return;
    }

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

    // Alternativa a la "Leaked Password Protection" nativa de Supabase
    // (requiere plan Pro — ver Security Advisor). Corta el registro
    // antes de llamar a Supabase si la contraseña aparece filtrada.
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

      // Paciente particular: sin institución. institucion_id queda NULL
      // a propósito (columna nullable, confirmado contra el esquema real).
      // Por eso mismo NUNCA recibe codigo_estudiante: el trigger
      // asignar_codigo_estudiante() solo actúa si institucion_id no es nulo.
      // psicologo_asignado_id sí va con valor: la política RLS del INSERT
      // (migración 011) rechaza cualquier id que no sea una cuenta real
      // con rol = 'psicologo', así que no hace falta revalidarlo acá.
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user.id,
            rol: 'paciente',
            institucion_id: null,
            email: cleanedEmail,
            nombre: cleanedNombre,
            telefono: cleanedTelefono,
            genero,
            psicologo_asignado_id: psicologoAsignadoId,
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

  // Sin psicólogos cargados (y ya sin error de carga) no tiene sentido
  // dejar avanzar el registro: la selección es obligatoria y no hay nada
  // para elegir. Se avisa en vez de mostrar un selector vacío roto.
  const sinPsicologosDisponibles = !cargandoPsicologos && !errorPsicologos && psicologos.length === 0;

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
          <p className="text-gray-500 mt-2 font-medium">Registro de Consultantes</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {errorPsicologos && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {errorPsicologos}
          </div>
        )}

        {sinPsicologosDisponibles && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-gray-700 rounded text-center text-sm font-semibold">
            Todavía no hay psicólogos registrados en la plataforma. Volvé a intentar más tarde.
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-6">

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Nombre y apellido"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800"
            />
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
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Debe incluir un dominio válido (ej. .com, .es)"
              placeholder="usuario@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
              required
              placeholder="Ej. 71234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800"
            />
            <p className="text-gray-500 text-xs mt-1">
              Lo usaremos únicamente para contactarte ante una emergencia.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Género
            </label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800"
            >
              <option value="">Selecciona...</option>
              {OPCIONES_GENERO.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Psicólogo Designado
            </label>
            <select
              value={psicologoAsignadoId}
              onChange={(e) => setPsicologoAsignadoId(e.target.value)}
              required
              disabled={cargandoPsicologos || sinPsicologosDisponibles}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">
                {cargandoPsicologos ? 'Cargando psicólogos...' : 'Selecciona...'}
              </option>
              {psicologos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Este psicólogo será quien vea los resultados de tus pruebas.
            </p>
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
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                )}
              </button>
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
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12 ${
                  confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors"
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
            disabled={loading || sinPsicologosDisponibles}
            className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
              loading || sinPsicologosDisponibles ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-700 hover:bg-orange-800'
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
          <p className="text-sm text-gray-600">
            ¿Tienes un código de institución?{' '}
            <Link to="/registro" className="text-orange-700 hover:text-orange-800 font-bold transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}