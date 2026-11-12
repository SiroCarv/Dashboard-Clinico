// Formato de fechas de las pantallas de este módulo (es-BO). Devuelve '—'
// cuando no hay fecha, para que las tablas no muestren "Invalid Date".
export function formatearFecha(fecha) {
  if (!fecha) return '—';
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '—';
  return valor.toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatearFechaHora(fecha) {
  if (!fecha) return '—';
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '—';
  return valor.toLocaleString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
