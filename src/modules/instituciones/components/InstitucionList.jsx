// Pestaña "Instituciones" del Panel Maestro: tabla con búsqueda por
// nombre/código, filtro por tipo de institución, badge de tipo, botón
// para copiar el enlace de registro (`/registro/:codigo`) al
// portapapeles, badge de código clickeable para copiar solo el código,
// y las acciones de editar/eliminar que delegan en el padre
// (PanelMaestro.jsx) vía props. Este componente no habla con Supabase
// directamente — solo recibe `instituciones` ya cargadas y notifica
// intenciones (onEdit, onDelete).
import { useState, useMemo } from 'react';
import { COLOR_MARCA } from '../../../shared/theme/paletaColores';
import { TIPOS_INSTITUCION, TIPO_POR_DEFECTO, obtenerLabelTipo } from '../data/tiposInstitucion';

// Valor especial del filtro (no es un tipo real) para "sin filtrar por tipo".
const FILTRO_TIPO_TODOS = 'todos';

export const InstitucionList = ({ instituciones, onEdit, onDelete }) => {
  // Dos IDs separados (no uno compartido): copiar el enlace y copiar el
  // código son dos acciones distintas que copian contenido distinto:
  // compartir un solo estado haría que clickear una mostrara "¡Copiado!"
  // en la otra también.
  const [enlaceCopiadoId, setEnlaceCopiadoId] = useState(null);
  const [codigoCopiadoId, setCodigoCopiadoId] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState(FILTRO_TIPO_TODOS);

  const copiarEnlace = async (inst) => {
    const enlace = `${window.location.origin}/registro/${inst.codigo_registro}`;
    try {
      await navigator.clipboard.writeText(enlace);
      setEnlaceCopiadoId(inst.id);
      setTimeout(() => setEnlaceCopiadoId(null), 2000);
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err);
    }
  };

  const copiarCodigo = async (inst) => {
    try {
      await navigator.clipboard.writeText(inst.codigo_registro);
      setCodigoCopiadoId(inst.id);
      setTimeout(() => setCodigoCopiadoId(null), 2000);
    } catch (err) {
      console.error('No se pudo copiar el código:', err);
    }
  };

  const hayFiltroTipoActivo = filtroTipo !== FILTRO_TIPO_TODOS;
  const hayBusquedaActiva = terminoBusqueda.trim().length > 0 || hayFiltroTipoActivo;

  const institucionesFiltradas = useMemo(() => {
    const termino = terminoBusqueda.trim().toLowerCase();
    return instituciones.filter((inst) => {
      const nombre = (inst.nombre || '').toLowerCase();
      const codigo = (inst.codigo_registro || '').toLowerCase();
      const coincideTexto = !termino || nombre.includes(termino) || codigo.includes(termino);

      const tipoInst = inst.tipo_institucion || TIPO_POR_DEFECTO;
      const coincideTipo = !hayFiltroTipoActivo || tipoInst === filtroTipo;

      return coincideTexto && coincideTipo;
    });
  }, [instituciones, terminoBusqueda, filtroTipo, hayFiltroTipoActivo]);

  const limpiarFiltros = () => {
    setTerminoBusqueda('');
    setFiltroTipo(FILTRO_TIPO_TODOS);
  };

  return (
    <div className="space-y-6">
      {/* Barra de acciones superior idéntica a Psicólogos, para que ambas
          pestañas del Panel Maestro tengan el botón principal en la
          misma posición relativa. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-black">Instituciones Registradas</h2>
          <p className="text-xs text-gray-700 font-medium">Administra los centros educativos y sus códigos de acceso institucional.</p>
        </div>
        <button
          onClick={() => onEdit()}
          className="bg-violet-400 hover:bg-orange-800 text-white font-bold uppercase tracking-wide text-sm px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+ Nueva Institución</span>
        </button>
      </div>

      {/* Barra de búsqueda: solo se muestra si existe al menos una institución registrada */}
      {instituciones.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          <input
            type="text"
            aria-label="Buscar instituciones por nombre o código de registro"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por nombre o código de registro..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800"
          />
          <select
            aria-label="Filtrar instituciones por tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all text-gray-800 bg-white"
          >
            <option value={FILTRO_TIPO_TODOS}>Todos los tipos</option>
            {TIPOS_INSTITUCION.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          <button
            onClick={limpiarFiltros}
            disabled={!hayBusquedaActiva}
            className="text-sm font-bold uppercase tracking-wide px-4 py-2.5 rounded-md shadow-md transition-colors duration-300 whitespace-nowrap bg-gray-400 text-white disabled:bg-gray-300 disabled:cursor-not-allowed enabled:bg-violet-400 enabled:hover:bg-orange-800"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {instituciones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No hay instituciones registradas aún.</p>
        </div>
      ) : institucionesFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No se encontraron instituciones con estos criterios.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-gray-200">Nombre</th>
                  <th className="p-4 font-bold border-b border-gray-200">Tipo</th>
                  <th className="p-4 font-bold border-b border-gray-200">Código de Acceso</th>
                  <th className="p-4 font-bold border-b border-gray-200 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {institucionesFiltradas.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{inst.nombre}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600 bg-gray-100 whitespace-nowrap">
                        {obtenerLabelTipo(inst.tipo_institucion)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => copiarCodigo(inst)}
                        title="Copiar código"
                        className={`px-3 py-1 border rounded-full text-sm font-mono font-semibold cursor-pointer transition-all hover:opacity-75 active:scale-95 ${COLOR_MARCA.tealAzulado.suave}`}
                      >
                        {codigoCopiadoId === inst.id ? '¡Copiado!' : inst.codigo_registro}
                      </button>
                    </td>
                    <td className="p-4 flex justify-end gap-4">
                      <button
                        onClick={() => copiarEnlace(inst)}
                        className="text-sm font-bold text-violet-400 hover:text-orange-800 transition-colors"
                      >
                        {enlaceCopiadoId === inst.id ? '¡Copiado!' : 'Copiar Enlace'}
                      </button>
                      <button
                        onClick={() => onEdit(inst)}
                        className="text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(inst.id)}
                        className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};