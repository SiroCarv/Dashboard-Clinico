// Pantalla final cuando el paciente (o su tutor) elige NO autorizar la
// participación en DocumentoConsentimiento.jsx. Es un callejón sin salida
// a propósito: no hay botón para "reintentar" desde acá, porque la
// participación es voluntaria y no se debe presionar a nadie a cambiar
// de decisión desde la misma pantalla donde la rechazó.
export default function ConsentimientoDenegado() {
  return (
    <div className="max-w-md w-full bg-white p-8 border-t-8 border-violet-400 rounded-lg shadow-xl text-center">
      <div className="mb-4 p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded-md">
        <p className="font-bold">Participación no autorizada</p>
        <p className="text-sm mt-1">
          Se registró la decisión de no participar en este tamizaje. Esto no tiene ninguna
          consecuencia académica, disciplinaria ni de ningún otro tipo.
        </p>
      </div>
      <p className="text-gray-500 text-sm font-medium">
        Si esta decisión fue un error, comunícate con tu psicólogo/a o con la institución
        educativa para volver a intentarlo.
      </p>
    </div>
  );
}
