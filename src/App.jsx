// Mapa de rutas de toda la aplicación. Cada página vive en su módulo
// (src/modules/[dominio]/) y se importa acá solo para declarar su ruta —
// App.jsx es la única parte del código que puede "ver" todos los módulos
// a la vez; ningún módulo se importa a sí mismo desde otro módulo.
//
// Capas de protección alrededor de <Routes>:
//   - GuardianDeSesion: cierra sesiones "abandonadas" (pestaña cerrada
//     sin logout) antes de que se renderice cualquier ruta — excepto
//     Inicio ("/"), que se muestra de inmediato mientras la verificación
//     corre en segundo plano (no hay nada privado que "flashear" ahí).
//   - RutaPublica: pantallas de acceso libre (Login, Registro...); si ya
//     hay sesión activa, redirige lejos de ellas. Inicio ("/") queda
//     fuera de esta capa a propósito: es la única pantalla que debe
//     verse siempre de inmediato, incluso para alguien con sesión activa
//     (ver GuardianDeSesion.jsx).
//   - RutaProtegida: pantallas privadas; exige un `rolRequerido` exacto
//     (paciente / psicologo / superadmin) o redirige.
import { Routes, Route } from 'react-router-dom';

// --- MÓDULOS ---
// Autenticación
import Login from './modules/autenticacion/pages/Login';
import Bienvenida from './modules/autenticacion/pages/Bienvenida';
import Registro from './modules/autenticacion/pages/Registro';
import RegistroParticular from './modules/autenticacion/pages/RegistroParticular';
import RecuperarPassword from './modules/autenticacion/pages/RecuperarPassword';
import RestablecerPassword from './modules/autenticacion/pages/RestablecerPassword';
import { Home } from './modules/observatorio';

// Evaluaciones
import Encuesta from './modules/evaluaciones/pages/Encuesta';
// Dashboard
import Dashboard from './modules/dashboard_clinico/pages/Dashboard';
import InformeConsolidado from './modules/dashboard_clinico/pages/InformeConsolidado';
// Instituciones
import PanelMaestro from './modules/instituciones/pages/PanelMaestro';
// --- CORE ---
import RutaProtegida from './core/security/RutaProtegida';
import RutaPublica from './core/security/RutaPublica';
import GuardianDeSesion from './core/security/GuardianDeSesion';

function App() {
  return (
    <GuardianDeSesion>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

        {/* SCRUM-33: pantalla de bienvenida + selector de perfil,
            previa a los dos flujos de registro ya existentes */}
        <Route path="/registro-nuevo" element={<RutaPublica><Bienvenida /></RutaPublica>} />

        {/* Ruta dinámica para atrapar el código de la institución */}
        <Route path="/registro/:codigo" element={<RutaPublica><Registro /></RutaPublica>} />
        {/* Dejamos la ruta normal por si alguien entra sin código, para mostrarle un mensaje de error */}
        <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />

        {/* Registro para personas sin institución (SCRUM-29): componente propio,
            no reutiliza Registro.jsx para no alterar el flujo institucional ya aprobado. */}
        <Route path="/registro-particular" element={<RutaPublica><RegistroParticular /></RutaPublica>} />
      
        <Route path="/recuperar-password" element={<RutaPublica><RecuperarPassword /></RutaPublica>} />
        {/* /restablecer-password queda SIN RutaPublica a propósito: depende de la
            sesión "oculta" que Supabase abre desde el link del correo de recuperación
            (ver comentario en RestablecerPassword.jsx). Envolverla la rompería. */}
        <Route path="/restablecer-password" element={<RestablecerPassword />} />
      
        <Route 
          path="/encuesta" 
          element={
            <RutaProtegida rolRequerido="paciente">
              <Encuesta />
            </RutaProtegida>
          } 
        />
      
        <Route 
          path="/dashboard" 
          element={
            <RutaProtegida rolRequerido="psicologo">
              <Dashboard />
            </RutaProtegida>
          } 
        />

        <Route 
          path="/dashboard/informe/:idPaciente" 
          element={
            <RutaProtegida rolRequerido="psicologo">
              <InformeConsolidado />
            </RutaProtegida>
          } 
        />

        <Route 
          path="/panel-maestro" 
          element={
            <RutaProtegida rolRequerido="superadmin">
              <PanelMaestro />
            </RutaProtegida>
          } 
        />
      </Routes>
    </GuardianDeSesion>
  );
}

export default App;