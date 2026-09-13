// Registro de PERSONA PARTICULAR — pacientes atendidos en un Centro de
// Salud donde estudiantes universitarios cubren horas de práctica.
//
// Mismo patrón de código de institución que Registro.jsx/
// RegistroDocente.jsx (verificación en vivo, debounce de 500ms, todo el
// resto del formulario deshabilitado hasta tener un código válido), con
// una diferencia: acá el código DEBE pertenecer a una institución tipo
// Centro de Salud — un código de colegio se trata como inválido, con un
// mensaje propio (ver personasParticularesService.buscarCentroDeSalud).
//
// Sin correo, sin contraseña: en su lugar, Carnet de Identidad (queda
// como identificador de acceso) + PIN de 6 dígitos (ver
// personasParticularesService.js para el porqué de los 6 dígitos). Sin
// checklist de contraseña segura — un PIN numérico es intencionalmente
// simple, pensado para completarse en la recepción del centro de salud,
// no para ser una contraseña robusta.
//
// Campos de perfil (a pedido del cliente, campo por campo): edad, sexo,
// estado civil, grado de instrucción, número de hijos, teléfono y tipo
// de trabajo. "Nombre completo" se agregó además de esa lista explícita
// — ninguna pantalla del sistema puede identificar a una persona sin un
// nombre, y la columna `usuarios.nombre` ya existe y la usan el resto de
// roles.
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { personasParticularesService, LONGITUD_PIN } from '../services/personasParticularesService';
import { FONDO_PLATAFORMA } from '../../../shared/assets/fondoPlataforma';
import logo from '../../../shared/assets/logo.webp';

const OPCIONES_SEXO = ['Masculino', 'Femenino', 'Prefiero no decir'];
const OPCIONES_ESTADO_CIVIL = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
const OPCIONES_GRADO_INSTRUCCION = ['Ninguno', 'Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado'];
const OPCIONES_TIPO_TRABAJO = [
  { value: 'particular', label: 'Particular' },
  { value: 'dependiente', label: 'Dependiente' },
];

const IconoOjoAbierto = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const IconoOjoCerrado = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
);

export default function RegistroPersonaParticular() {
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [institucion, setInstitucion] = useState(null);
  const [codigoTipoIncorrecto, setCodigoTipoIncorrecto] = useState(false);
  const [buscandoCodigo, setBuscandoCodigo] = useState(false);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [gradoInstruccion, setGradoInstruccion] = useState('');
  const [numeroHijos, setNumeroHijos] = useState('');
  const [tipoTrabajo, setTipoTrabajo] = useState('');

  const [carnetIdentidad, setCarnetIdentidad] = useState('');
  const [pin, setPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmarPin, setShowConfirmarPin] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const primerRenderRef = useRef(true);

  const pinValido = new RegExp(`^\\d{${LONGITUD_PIN}}$`).test(pin);

  // Verificación en vivo del código, igual patrón que RegistroDocente.jsx.
  useEffect(() => {
    const codigoLimpio = codigoIngresado.trim().toUpperCase();

    if (!codigoLimpio) {
      primerRenderRef.current = false;
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const { institucion: encontrada, tipoIncorrecto } =
          await personasParticularesService.buscarCentroDeSalud(codigoLimpio);
        setInstitucion(encontrada);
        setCodigoTipoIncorrecto(tipoIncorrecto);
      } catch (err) {
        console.error('Error al verificar el código:', err.message);
        setInstitucion(null);
        setCodigoTipoIncorrecto(false);
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
      setCodigoTipoIncorrecto(false);
      setBuscandoCodigo(false);
    } else {
      setBuscandoCodigo(true);
    }
  };

  const handlePinChange = (setter) => (e) => {
    // Solo dígitos, tope de LONGITUD_PIN caracteres — respaldo en JS del
    // `inputMode="numeric"` + `maxLength` nativos.
    const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, LONGITUD_PIN);
    setter(soloDigitos);
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!institucion) {
      setError('Ingresa un código de Centro de Salud válido para continuar.');
      return;
    }

    if (!nombre || !telefono || !edad || !sexo || !estadoCivil || !gradoInstruccion || numeroHijos === '' || !tipoTrabajo) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (!pinValido) {
      setError(`El PIN debe tener exactamente ${LONGITUD_PIN} dígitos.`);
      return;
    }

    if (pin !== confirmarPin) {
      setError('Los PIN no coinciden. Por favor, verifica.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await personasParticularesService.registrar({
        institucionId: institucion.id,
        carnetIdentidad,
        pin,
        nombre,
        telefono,
        edad: Number(edad),
        sexo,
        estadoCivil,
        gradoInstruccion,
        numeroHijos: Number(numeroHijos),
        tipoTrabajo,
      });

      navigate('/login-particular', {
        state: { mensajeRegistro: '¡Cuenta registrada exitosamente! Ya puedes iniciar sesión con tu carnet y tu PIN.' },
      });
    } catch (err) {
      console.error('Error en el registro:', err.message);
      setError(err.message || 'Ocurrió un error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${FONDO_PLATAFORMA})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl my-8">
        <div className="mb-4">
          <Link to="/" className="text-sm font-bold text-gray-500 hover:text-orange-700 transition-colors inline-flex items-center gap-1">
            ← Volver al inicio
          </Link>
        </div>

        <div className="text-center mb-8">
          <img src={logo} alt="Logo Plataforma Diagnóstica" className="mx-auto w-50 h-auto relative z-10 -mb-15 -mt-15" />
          <h2 className="text-3xl font-extrabold text-black relative z-20">Registro — Persona Particular</h2>
          <p className="text-gray-500 mt-2 font-medium">Ingresa con el código de tu Centro de Salud</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mb-1">Código de Centro de Salud</label>
            <input
              type="text"
              value={codigoIngresado}
              onChange={handleCodigoChange}
              placeholder="Ej. CS-4A9B"
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
                <span className="text-green-600 font-semibold">✓ Centro de Salud encontrado</span>
              ) : codigoTipoIncorrecto ? (
                <span className="text-red-500 font-semibold">❌ Ese código pertenece a un colegio, no a un Centro de Salud</span>
              ) : codigoIngresado.trim().length > 0 ? (
                <span className="text-red-500 font-semibold">❌ Código no encontrado</span>
              ) : (
                <span className="text-gray-400">Pídelo en la recepción del Centro de Salud.</span>
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
            <label className="block text-sm font-bold text-black mb-1">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={!institucion}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Edad</label>
              <input
                type="number"
                min="0"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Sexo</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona...</option>
                {OPCIONES_SEXO.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Estado civil</label>
              <select
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona...</option>
                {OPCIONES_ESTADO_CIVIL.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Grado de instrucción</label>
              <select
                value={gradoInstruccion}
                onChange={(e) => setGradoInstruccion(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona...</option>
                {OPCIONES_GRADO_INSTRUCCION.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Número de hijos</label>
              <input
                type="number"
                min="0"
                value={numeroHijos}
                onChange={(e) => setNumeroHijos(e.target.value)}
                required
                disabled={!institucion}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">Tipo de trabajo</label>
            <select
              value={tipoTrabajo}
              onChange={(e) => setTipoTrabajo(e.target.value)}
              required
              disabled={!institucion}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">Selecciona...</option>
              {OPCIONES_TIPO_TRABAJO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">Carnet de Identidad</label>
            <input
              type="text"
              value={carnetIdentidad}
              onChange={(e) => setCarnetIdentidad(e.target.value)}
              required
              disabled={!institucion}
              placeholder="Sin puntos ni espacios"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">PIN ({LONGITUD_PIN} dígitos)</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={handlePinChange(setPin)}
                required
                disabled={!institucion}
                placeholder="••••••"
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12 disabled:bg-gray-100 ${
                  pinValido ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              />
              <button type="button" onClick={() => setShowPin(!showPin)} disabled={!institucion} tabIndex="-1"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors disabled:opacity-50">
                {showPin ? <IconoOjoAbierto /> : <IconoOjoCerrado />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">Confirmar PIN</label>
            <div className="relative">
              <input
                type={showConfirmarPin ? 'text' : 'password'}
                inputMode="numeric"
                value={confirmarPin}
                onChange={handlePinChange(setConfirmarPin)}
                required
                disabled={!institucion}
                placeholder="••••••"
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-700 focus:border-orange-700 outline-none transition-all text-gray-800 pr-12 disabled:bg-gray-100 ${
                  confirmarPin && pin !== confirmarPin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button type="button" onClick={() => setShowConfirmarPin(!showConfirmarPin)} disabled={!institucion} tabIndex="-1"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-700 transition-colors disabled:opacity-50">
                {showConfirmarPin ? <IconoOjoAbierto /> : <IconoOjoCerrado />}
              </button>
            </div>
            {confirmarPin && pin !== confirmarPin && (
              <p className="text-red-500 text-xs mt-1 font-semibold">Los PIN no coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !institucion || !pinValido}
            className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 shadow-md uppercase tracking-wide flex justify-center items-center ${
              loading || !institucion || !pinValido ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-700 hover:bg-orange-800'
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
            <Link to="/login-particular" className="text-orange-700 hover:text-orange-800 font-bold transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}