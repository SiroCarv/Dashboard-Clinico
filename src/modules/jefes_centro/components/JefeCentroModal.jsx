// Modal de creación/edición de una cuenta de Jefe/a de Centro de Salud.
// Mismo patrón y mismos estilos que PsicologoModal (módulo `psicologos`),
// con un campo propio: el centro de salud al que pertenece la cuenta.
// En modo creación pide contraseña temporal (la persona la cambia en su
// primer ingreso); en modo edición esa sección desaparece porque
// editar-jefe-centro no toca la contraseña.
//
// JefeCentroModalContenido se separa del wrapper para que, mientras
// isOpen es false, el contenido ni siquiera se monte — así cada apertura
// arranca con estado fresco desde `jefeEditado`, sin useEffect.
//
// Centros ya ocupados: `centrosOcupados` trae los ids de centros que ya
// tienen OTRO jefe/a; esas opciones se muestran deshabilitadas con la
// leyenda "(ya tiene jefe/a)". Es solo ayuda visual: la regla de verdad
// la valida la Edge Function.
//
// Errores de guardado: `onSave` lanza si algo falla; acá se atrapa y se
// muestra dentro del propio modal (que queda abierto con lo escrito), en
// vez de un alert() del navegador.
import { useState, useMemo } from 'react';
import { validarPasswordSegura, LONGITUD_MINIMA_PASSWORD } from '../../../shared/utils/validarPasswordSegura';
import { ChecklistPasswordSegura } from '../../../shared/components/ChecklistPasswordSegura';

export const JefeCentroModal = ({ isOpen, onClose, onSave, jefeEditado, centros, centrosOcupados }) => {
  if (!isOpen) return null;

  return (
    <JefeCentroModalContenido
      onClose={onClose}
      onSave={onSave}
      jefeEditado={jefeEditado}
      centros={centros}
      centrosOcupados={centrosOcupados}
    />
  );
};

function JefeCentroModalContenido({ onClose, onSave, jefeEditado, centros, centrosOcupados }) {
  const enEdicion = Boolean(jefeEditado);

  const [nombre, setNombre] = useState(jefeEditado?.nombre || '');
  const [correo, setCorreo] = useState(jefeEditado?.email || '');
  const [institucionId, setInstitucionId] = useState(jefeEditado?.institucion_id || '');
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validacionPassword = useMemo(() => validarPasswordSegura(passwordTemporal), [passwordTemporal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!enEdicion && !validacionPassword.esValida) {
      setError(
        `La contraseña temporal debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres e incluir mayúscula, minúscula, número y símbolo.`
      );
      return;
    }

    setLoading(true);
    try {
      await onSave({ nombre, correo, passwordTemporal, institucionId });
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
              {enEdicion ? 'Editar Jefe/a de Centro' : 'Agregar Jefe/a de Centro'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {enEdicion
                ? 'Actualiza los datos de la cuenta'
                : 'Crea una cuenta de supervisión para un Centro de Salud'}
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
                placeholder="Ej. Dra. Ana Rojas"
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
                placeholder="jefatura@centro.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Centro de Salud</label>
              <select
                required
                value={institucionId}
                onChange={(e) => setInstitucionId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800 bg-white"
              >
                <option value="" disabled>Selecciona un centro</option>
                {centros.map((centro) => {
                  const ocupado = centrosOcupados.has(centro.id);
                  return (
                    <option key={centro.id} value={centro.id} disabled={ocupado}>
                      {centro.nombre}
                      {ocupado ? ' (ya tiene jefe/a)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {!enEdicion && (
              <div>
                <label className="block text-sm font-bold text-black mb-1">Contraseña temporal</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    minLength={LONGITUD_MINIMA_PASSWORD}
                    value={passwordTemporal}
                    onChange={(e) => setPasswordTemporal(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800 pr-12"
                    placeholder={`Mínimo ${LONGITUD_MINIMA_PASSWORD} caracteres`}
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
                {passwordTemporal.length > 0 && (
                  <ChecklistPasswordSegura requisitos={validacionPassword.requisitos} />
                )}
              </div>
            )}

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
                disabled={loading || (!enEdicion && !validacionPassword.esValida)}
                className={`px-6 py-3 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors duration-300 flex justify-center items-center ${
                  loading || (!enEdicion && !validacionPassword.esValida)
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-violet-400 hover:bg-orange-800 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {enEdicion ? 'Guardando...' : 'Creando...'}
                  </span>
                ) : (
                  enEdicion ? 'Guardar' : 'Crear cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
