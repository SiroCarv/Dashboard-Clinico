// Botón "Exportar a Excel" reutilizable (superadmin: instituciones,
// psicólogos y resultados globales). Maneja por sí solo el estado de
// "generando" (deshabilitado + spinner, para evitar doble clic) y un
// mensaje de error visible si la exportación falla — antes de este
// componente, la exportación del Dashboard del psicólogo no atrapaba
// errores y una falla pasaba en silencio.
//
// No sabe qué se exporta: recibe `onExportar` ya armado por quien lo
// usa. Mismo aspecto que el botón de exportar del Dashboard del
// psicólogo (mismo acento, mismo icono, mismo texto "Generando...").
import { useState } from 'react';
import { COLOR_MARCA } from '../theme/paletaColores';

export function BotonExportarExcel({
  onExportar,
  deshabilitado = false,
  motivoDeshabilitado = 'No hay datos visibles para exportar',
}) {
  const [exportando, setExportando] = useState(false);
  const [huboError, setHuboError] = useState(false);

  const handleClick = async () => {
    setHuboError(false);
    setExportando(true);
    try {
      await onExportar();
    } catch (err) {
      console.error('No se pudo generar el archivo de Excel:', err);
      setHuboError(true);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="flex flex-col items-start sm:items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={deshabilitado || exportando}
        title={deshabilitado ? motivoDeshabilitado : undefined}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${COLOR_MARCA.tealAzulado.botonPrimario}`}
      >
        {exportando ? (
          <>
            <svg
              className="animate-spin -ml-1 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Exportar a Excel
          </>
        )}
      </button>

      {huboError && (
        <p role="alert" className="text-xs font-semibold text-red-700">
          No se pudo generar el archivo. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}