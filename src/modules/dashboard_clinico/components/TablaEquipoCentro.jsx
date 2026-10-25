// Tabla del equipo de psicólogos/as de un Centro de Salud, para la pestaña
// "Equipo" del Panel de Supervisión del Jefe/a de Centro. Solo lectura y
// sin métricas por psicólogo (decisión de la cliente): nombre, turno /
// cargo y correo. Mismo marco visual que TablaPersonasParticulares
// (tarjeta con franja violeta) y mismo estado vacío punteado.
//
// Importa la etiqueta de turno desde la API pública del módulo
// `psicologos` (nunca una ruta interna).
import { ETIQUETA_TURNO_PSICOLOGO } from '../../psicologos';

export function TablaEquipoCentro({ equipo }) {
  if (equipo.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">Tu centro aún no tiene psicólogos/as asignados/as.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border-t-8 border-violet-400 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-gray-200">Psicólogo/a</th>
              <th className="p-4 font-bold border-b border-gray-200">Turno / Cargo</th>
              <th className="p-4 font-bold border-b border-gray-200">Correo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {equipo.map((psicologo) => (
              <tr key={psicologo.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-800 font-medium">
                  {psicologo.nombre || <span className="text-gray-400 italic font-normal">Sin nombre registrado</span>}
                </td>
                <td className="p-4 text-gray-600">
                  {ETIQUETA_TURNO_PSICOLOGO[psicologo.turno_psicologo] || (
                    <span className="text-gray-400 italic">Sin definir</span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{psicologo.email || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
