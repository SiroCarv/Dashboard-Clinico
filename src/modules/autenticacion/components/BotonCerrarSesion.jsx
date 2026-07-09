import { useCerrarSesion } from '../hooks/useCerrarSesion';

export default function BotonCerrarSesion() {
  const { cerrarSesion, cargando } = useCerrarSesion();

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      disabled={cargando}
      className={`flex items-center px-4 py-2 rounded-md font-bold text-sm uppercase tracking-wide
        transition-colors duration-300 shadow-sm
        ${cargando
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'}`}
    >
      {cargando ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saliendo...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3" />
          </svg>
          Cerrar sesión
        </>
      )}
    </button>
  );
}