import { useState, useEffect } from 'react';

export default function EncuestaExitosa() {
  const [mostrarMensaje, setMostrarMensaje] = useState(true);
  const [desvanecer, setDesvanecer] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setDesvanecer(true);
    }, 5000);

    const removeTimer = setTimeout(() => {
      setMostrarMensaje(false);
      setDesvanecer(false);
    }, 6000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl text-center">
      {mostrarMensaje && (
        <div
          className={`mb-4 p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-sm font-bold transition-opacity duration-1000 ease-in-out ${
            desvanecer ? 'opacity-0' : 'opacity-100'
          }`}
        >
          ¡Evaluación enviada exitosamente!
        </div>
      )}
      <h2 className="text-2xl font-extrabold text-black mb-2">Gracias por completarla</h2>
      <p className="text-gray-500 font-medium">
        Tu psicólogo(a) revisará tus respuestas. Puedes cerrar sesión desde la barra superior.
      </p>
    </div>
  );
}