// src/modules/instituciones/components/PsicologoModal.jsx
import { useState } from 'react';

export const PsicologoModal = ({ isOpen, onClose, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ nombre, correo, passwordTemporal });
    setLoading(false);
    setNombre('');
    setCorreo('');
    setPasswordTemporal('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border-t-8 border-orange-500 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-black">Agregar Psicólogo</h2>
            <p className="text-gray-500 mt-2 font-medium">Crea una cuenta de acceso para un profesional</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Nombre completo</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
                placeholder="Ej. Lic. María Fernández"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
                placeholder="psicologo@clinica.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Contraseña temporal</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordTemporal}
                  onChange={(e) => setPasswordTemporal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800 pr-12"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors"
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
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
                disabled={loading}
                className={`px-6 py-3 rounded-md font-bold uppercase tracking-wide shadow-md transition-colors duration-300 flex justify-center items-center ${
                  loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creando...
                  </span>
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
};