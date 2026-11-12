// Modal de creación/edición de la cuenta ÚNICA de Docente Supervisora.
// Mismo patrón y estilos que JefeCentroModal (módulo `jefes_centro`).
//
// Diferencia clave: al EDITAR la contraseña es opcional. Como la cuenta es
// única y no se puede borrar, si cambia la persona se reutiliza la misma
// cuenta poniéndole nombre, correo y una contraseña nueva; dejar el campo
// vacío conserva la contraseña actual.
//
// SupervisoraModalContenido se separa del wrapper para que, mientras
// isOpen es false, el contenido ni se monte: cada apertura arranca con
// estado fresco desde `cuentaEditada`, sin useEffect.
//
// `onSave` lanza si algo falla; acá se atrapa y se muestra dentro del modal,
// que queda abierto con lo escrito.
import { useState, useMemo } from 'react';
import { validarPasswordSegura, LONGITUD_MINIMA_PASSWORD } from '../../../shared/utils/validarPasswordSegura';
import { ChecklistPasswordSegura } from '../../../shared/components/ChecklistPasswordSegura';

export const SupervisoraModal = ({ isOpen, onClose, onSave, cuentaEditada }) => {
  if (!isOpen) return null;

  return <SupervisoraModalContenido onClose={onClose} onSave={onSave} cuentaEditada={cuentaEditada} />;
};

function SupervisoraModalContenido({ onClose, onSave, cuentaEditada }) {
  const enEdicion = Boolean(cuentaEditada);

  const [nombre, setNombre] = useState(cuentaEditada?.nombre || '');
  const [correo, setCorreo] = useState(cuentaEditada?.email || '');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validacionPassword = useMemo(() => validarPasswordSegura(password), [password]);

  // Al crear la contraseña es obligatoria; al editar solo se valida si la
  // escribieron.
  const debeValidarPassword = !enEdicion || password.length > 0;
  const passwordInvalida = debeValidarPassword && !validacionPassword.esValida;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordInvalida) {
      setError(
        `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres e incluir mayúscula, minúscula, número y símbolo.`
      );
      return;
    }

    setLoading(true);
    try {
      await onSave({ nombre, correo, password });
    } catch (err) {
      setError(err.message || 'No se pudo guardar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-black">
              {enEdicion ? 'Editar Docente Supervisora' : 'Crear Docente Supervisora'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {enEdicion
                ? 'Actualiza los datos de la cuenta única'
                : 'Crea la cuenta única de supervisión de pasantías'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Nombre completo</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
                placeholder="Ej. Lic. María Gutiérrez"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
                placeholder="docente@universidad.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">
                {enEdicion ? 'Contraseña nueva (opcional)' : 'Contraseña temporal'}
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required={!enEdicion}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800 pr-12"
                  placeholder={
                    enEdicion ? 'Déjala vacía para conservar la actual' : `Mínimo ${LONGITUD_MINIMA_PASSWORD} caracteres`
                  }
                />
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-violet-400 transition-colors"
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && <ChecklistPasswordSegura requisitos={validacionPassword.requisitos} />}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-md text-gray-600 hover:bg-gray-100 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || passwordInvalida}
                className={`px-6 py-3 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors duration-300 flex justify-center items-center ${
                  loading || passwordInvalida
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-violet-400 hover:bg-orange-800 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {enEdicion ? 'Guardando...' : 'Creando...'}
                  </span>
                ) : enEdicion ? (
                  'Guardar'
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
