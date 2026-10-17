// Componente "invisible": no dibuja nada, solo activa el cierre automático
// de sesión por inactividad (ver hooks/useCierrePorInactividad.js para la
// lógica completa y data/limitesInactividad.js para los tiempos por rol).
//
// Existe como componente, y no como un hook suelto, porque App.jsx solo
// puede montar componentes — y debe vivir dentro del Router, ya que al
// cerrar la sesión navega a Login.
import { useCierrePorInactividad } from '../hooks/useCierrePorInactividad';

export default function CierrePorInactividad() {
  useCierrePorInactividad();
  return null;
}