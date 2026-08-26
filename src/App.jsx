// Mapa de rutas de toda la aplicación. Cada página vive en su módulo
// (src/modules/[dominio]/) y se importa acá solo para declarar su ruta —
// App.jsx es la única parte del código que puede "ver" todos los módulos
// a la vez; ningún módulo se importa a sí mismo desde otro módulo.
//
// Capas de protección alrededor de <Routes>:
//   - GuardianDeSesion: cierra sesiones "abandonadas" (pestaña cerrada
//     sin logout) antes de que se renderice cualquier ruta — excepto
//     Inicio ("/"), que se muestra de inmediato mientras la verificación
//     corre en segundo plano (no hay nada que "flashear": es solo un
//     redirect a /login, sin contenido propio — ver SCRUM-46).
//   - RutaPublica: pantallas de acceso libre (Login, Registro...); si ya
//     hay sesión activa, redirige lejos de ellas.
//   - RutaProtegida: pantallas privadas; exige un `rolRequerido` exacto
//     (paciente / psicologo / superadmin / docente) o redirige.
import { Routes, Route, Navigate } from 'react-router-dom';

// --- MÓDULOS ---
// Autenticación
import Login from './modules/autenticacion/pages/Login';
import Bienvenida from './modules/autenticacion/pages/Bienvenida';
import Registro from './modules/autenticacion/pages/Registro';
import RegistroDocente from './modules/autenticacion/pages/RegistroDocente';
import RecuperarPassword from './modules/autenticacion/pages/RecuperarPassword';
import RestablecerPassword from './modules/autenticacion/pages/RestablecerPassword';

// Evaluaciones
import Encuesta from './modules/evaluaciones/pages/Encuesta';
// Dashboard
import Dashboard from './modules/dashboard_clinico/pages/Dashboard';
import InformeConsolidado from './modules/dashboard_clinico/pages/InformeConsolidado';
// Instituciones
import PanelMaestro from './modules/instituciones/pages/PanelMaestro';
import PanelConsolidadoSuperadmin from './modules/dashboard_clinico/pages/PanelConsolidadoSuperadmin';
// Casos de Docente (SCRUM-51)
import { RegistroCasoDocente } from './modules/casos_docente';
// --- CORE ---
import RutaProtegida from './core/security/RutaProtegida';
import RutaPublica from './core/security/RutaPublica';
import GuardianDeSesion from './core/security/GuardianDeSesion';

function App() {
  return (
    <GuardianDeSesion>
      <Routes>
        {/* SCRUM-46: "/" ya no tiene una landing propia (se retiró toda
            la sección de imágenes/observatorio) — ahora entra directo
            a Login, que queda como pantalla principal. */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

        {/* SCRUM-33: pantalla de bienvenida + selector de perfil,
            previa a los dos flujos de registro ya existentes */}
        <Route path="/registro-nuevo" element={<RutaPublica><Bienvenida /></RutaPublica>} />

        {/* Ruta dinámica para atrapar el código de la institución */}
        <Route path="/registro/:codigo" element={<RutaPublica><Registro /></RutaPublica>} />
        {/* Dejamos la ruta normal por si alguien entra sin código, para mostrarle un mensaje de error */}
        <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />

        {/* Registro de docentes (SCRUM-47): mismo patrón de código de
            institución que Registro.jsx, sin campos de estudiante. */}
        <Route path="/registro-docente" element={<RutaPublica><RegistroDocente /></RutaPublica>} />
      
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

        {/* Panel Consolidado de Resultados (SCRUM-56): resultados de
            evaluaciones de todas las instituciones y psicólogos, con
            filtros. Vive en dashboard_clinico porque es la misma épica
            "Monitoreo y Alertas" que ya cubre el Dashboard del
            psicólogo, solo que sin restringir por institución. */}
        <Route 
          path="/panel-resultados" 
          element={
            <RutaProtegida rolRequerido="superadmin">
              <PanelConsolidadoSuperadmin />
            </RutaProtegida>
          } 
        />

        {/* Registro de caso por Docente (SCRUM-51): el docente completa
            el cuestionario a nombre de un alumno de su institución y
            elige qué psicólogo lo revisará. */}
        <Route 
          path="/registro-caso" 
          element={
            <RutaProtegida rolRequerido="docente">
              <RegistroCasoDocente />
            </RutaProtegida>
          } 
        />
      </Routes>
    </GuardianDeSesion>
  );
}

export default App;