export default function EncuestaExitosa() {
  return (
    <div className="max-w-md w-full bg-white p-8 border-t-8 border-orange-500 rounded-lg shadow-xl text-center">
      <div className="mb-4 p-4 bg-green-100 border border-green-500 text-green-800 rounded-lg shadow-sm font-bold">
        ¡Evaluación enviada exitosamente!
      </div>
      <h2 className="text-2xl font-extrabold text-black mb-2">Gracias por completarla</h2>
      <p className="text-gray-500 font-medium">
        Tu psicólogo(a) revisará tus respuestas. Puedes cerrar sesión desde la barra superior.
      </p>
    </div>
  );
}