// Mapa de rutas de toda la aplicación. Cada página vive en su módulo
// (src/modules/[dominio]/) y se importa acá solo para declarar su ruta —
// App.jsx es la única parte del código que puede "ver" todos los módulos
// a la vez; ningún módulo se importa a sí mismo desde otro módulo.
//
// Capas de protección alrededor de <Routes>:
//   - CierrePorInactividad: cierra la sesión de quien dejó de usar la
//     plataforma (15 min psicólogo/superadmin/docente/jefe de centro/
//     docente supervisora, 30 min estudiante/persona particular). Se
//     monta FUERA de GuardianDeSesion a propósito:
//     ese guardián no muestra a sus hijos hasta terminar su verificación
//     inicial, y este debe estar activo desde el primer momento para
//     enterarse también de los cierres que ese guardián hace al abrir.
//   - GuardianDeSesion: cierra sesiones "abandonadas" (pestaña cerrada
//     sin logout) antes de que se renderice cualquier ruta — excepto
//     Inicio ("/"), que se muestra de inmediato mientras la verificación
//     corre en segundo plano (es contenido público, sin nada privado
//     que "flashear" — landing del Observatorio de Salud Mental,
//     restaurada tras SCRUM-46).
//   - RutaPublica: pantallas de acceso libre (Login, Registro...); si ya
//     hay sesión activa, redirige lejos de ellas.
//   - RutaProtegida: pantallas privadas; exige un `rolRequerido` exacto
//     (paciente / psicologo / superadmin / docente / persona_particular /
//     jefe_centro / docente_supervisora) o redirige.
//
// Persona Particular (sprint "Persona Particular"): usa rutas propias
// (/registro-particular, /login-particular, /encuesta-particular)
// separadas de las de Estudiante, aunque /encuesta-particular renderice
// el mismo componente <Encuesta /> — RutaProtegida exige un rol exacto
// por ruta, así que dos roles necesitan dos rutas para llegar a la misma
// pantalla (ver comentario completo en rutasPorDefecto.js). El informe
// individual (/dashboard/informe-particular/:idPersona) es una página
// nueva y propia, InformePersonaParticular, distinta de InformeConsolidado.
//
// Jefe/a de Centro de Salud (rol jefe_centro): tiene su propio panel
// (/supervision-centro) y, para abrir el informe de una persona, una ruta
// propia que reutiliza la misma página InformePersonaParticular con otro
// título y otro link de "Volver" (el psicólogo y el jefe/a no comparten
// rutas porque RutaProtegida exige un rol exacto por ruta).
//
// Docente Supervisora (rol docente_supervisora, cuenta única): su panel es
// /supervision-pasantias (lista de pasantes) y /supervision-pasantias/
// pasante/:idPasante (detalle y calificación). Para abrir el informe de una
// persona reutiliza las mismas páginas del psicólogo (InformePersonaParticular
// e InformeConsolidado) con su propio título, sin exportar a Excel y con un
// "Volver" que regresa a la pasante que se estaba revisando — por eso la
// ruta lleva :idPasante y se usan los dos envoltorios de más abajo.
import { Routes, Route, useParams } from 'react-router-dom';

// --- MÓDULOS ---
// Autenticación
import Login from './modules/autenticacion/pages/Login';
import Bienvenida from './modules/autenticacion/pages/Bienvenida';
import Registro from './modules/autenticacion/pages/Registro';
import RegistroDocente from './modules/autenticacion/pages/RegistroDocente';
import RecuperarPassword from './modules/autenticacion/pages/RecuperarPassword';
import RestablecerPassword from './modules/autenticacion/pages/RestablecerPassword';
// API pública del módulo (no una ruta interna): cierre automático por inactividad.
import { CierrePorInactividad } from './modules/autenticacion';
// Home (restaurado): landing pública con misión/visión -- ver conversación
// de reunión. Épica "Observatorio de Salud Mental" reconfirmada con el
// cliente.
import { Home } from './modules/observatorio';
// Persona Particular (NUEVO)
import { RegistroPersonaParticular, LoginPersonaParticular } from './modules/personas-particulares';

// Evaluaciones
import Encuesta from './modules/evaluaciones/pages/Encuesta';
// Dashboard
import Dashboard from './modules/dashboard_clinico/pages/Dashboard';
import InformeConsolidado from './modules/dashboard_clinico/pages/InformeConsolidado';
import InformePersonaParticular from './modules/dashboard_clinico/pages/InformePersonaParticular';
import IndicadoresGSHS from './modules/dashboard_clinico/pages/IndicadoresGSHS';
import PanelSupervisionCentro from './modules/dashboard_clinico/pages/PanelSupervisionCentro';
// Instituciones
import PanelMaestro from './modules/instituciones/pages/PanelMaestro';
import PanelConsolidadoSuperadmin from './modules/dashboard_clinico/pages/PanelConsolidadoSuperadmin';
// Casos de Docente (SCRUM-51)
import { RegistroCasoDocente } from './modules/casos_docente';
// Supervisión de pasantías (Docente Supervisora)
import { PanelSupervisora, DetallePasante } from './modules/supervision_pasantias';
// --- CORE ---
import RutaProtegida from './core/security/RutaProtegida';
import RutaPublica from './core/security/RutaPublica';
import GuardianDeSesion from './core/security/GuardianDeSesion';
// --- SHARED ---
// Fallback de enrutamiento (no pertenece a ningún módulo de negocio)
import NoEncontrado from './shared/pages/NoEncontrado';

// Envoltorios de los informes individuales que abre la Docente Supervisora.
// Viven acá (y no en su módulo) porque reutilizan páginas de
// `dashboard_clinico`, y App.jsx es el único lugar autorizado a juntar
// módulos. Leen :idPasante de la ruta solo para armar el link de "Volver".
const TITULO_BARRA_SUPERVISORA = 'Supervisión de Pasantías (Docente Supervisora)';

function InformeParticularSupervisora() {
  const { idPasante } = useParams();
  return (
    <InformePersonaParticular
      tituloBarra={TITULO_BARRA_SUPERVISORA}
      rutaVolver={`/supervision-pasantias/pasante/${encodeURIComponent(idPasante)}`}
      textoVolver="← Volver a la pasante"
    />
  );
}

function InformeEstudianteSupervisora() {
  const { idPasante } = useParams();
  return (
    <InformeConsolidado
      tituloBarra={TITULO_BARRA_SUPERVISORA}
      rutaVolver={`/supervision-pasantias/pasante/${encodeURIComponent(idPasante)}`}
      textoVolver="← Volver a la pasante"
      permitirExportar={false}
    />
  );
}

function App() {
  return (
    <>
      <CierrePorInactividad />
      <GuardianDeSesion>
        <Routes>
          {/* Home restaurado (reemplaza al redirect de SCRUM-46): landing
              pública con misión/visión, reconfirmada con el cliente. */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

          {/* SCRUM-33: pantalla de bienvenida + selector de perfil,
              previa a los tres flujos de registro ya existentes */}
          <Route path="/registro-nuevo" element={<RutaPublica><Bienvenida /></RutaPublica>} />

          {/* Ruta dinámica para atrapar el código de la institución */}
          <Route path="/registro/:codigo" element={<RutaPublica><Registro /></RutaPublica>} />
          {/* Dejamos la ruta normal por si alguien entra sin código, para mostrarle un mensaje de error */}
          <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />

          {/* Registro de docentes (SCRUM-47): mismo patrón de código de
              institución que Registro.jsx, sin campos de estudiante. */}
          <Route path="/registro-docente" element={<RutaPublica><RegistroDocente /></RutaPublica>} />

          {/* Registro e inicio de sesión de Persona Particular: código de
              Centro de Salud + carnet/PIN, sin correo — ver
              personasParticularesService.js. Ruta dinámica con :codigo
              (igual que /registro/:codigo) para que el enlace que copia
              "Copiar Enlace" en el Panel Maestro, para una institución
              tipo Centro de Salud, llegue con el código ya precargado. */}
          <Route path="/registro-particular/:codigo" element={<RutaPublica><RegistroPersonaParticular /></RutaPublica>} />
          <Route path="/registro-particular" element={<RutaPublica><RegistroPersonaParticular /></RutaPublica>} />
          <Route path="/login-particular" element={<RutaPublica><LoginPersonaParticular /></RutaPublica>} />

          <Route path="/recuperar-password" element={<RutaPublica><RecuperarPassword /></RutaPublica>} />
          {/* /restablecer-password queda SIN RutaPublica a propósito: depende de la
              sesión "oculta" que Supabase abre desde el link del correo de recuperación
              (ver comentario en RestablecerPassword.jsx). Envolverla la rompería.
              No existe un equivalente para Persona Particular — historia
              "Eliminación de recuperación de acceso para Persona Particular". */}
          <Route path="/restablecer-password" element={<RestablecerPassword />} />
      
          <Route 
            path="/encuesta" 
            element={
              <RutaProtegida rolRequerido="paciente">
                <Encuesta />
              </RutaProtegida>
            } 
          />

          {/* Persona Particular responde el mismo componente <Encuesta />
              que Estudiante, en una ruta separada (ver nota de archivo
              arriba) — Encuesta.jsx decide internamente, según el rol
              real, qué formularios mostrar. */}
          <Route
            path="/encuesta-particular"
            element={
              <RutaProtegida rolRequerido="persona_particular">
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

          {/* Informe individual de Persona Particular (NUEVO). */}
          <Route
            path="/dashboard/informe-particular/:idPersona"
            element={
              <RutaProtegida rolRequerido="psicologo">
                <InformePersonaParticular />
              </RutaProtegida>
            }
          />

          {/* Panel de supervisión del Jefe/a de Centro de Salud: equipo,
              gráficas y personas de su centro (scopeado por RLS). */}
          <Route
            path="/supervision-centro"
            element={
              <RutaProtegida rolRequerido="jefe_centro">
                <PanelSupervisionCentro />
              </RutaProtegida>
            }
          />

          {/* Informe individual de Persona Particular para el Jefe/a de
              Centro: misma página que la del psicólogo, con su propio
              título y link de regreso. */}
          <Route
            path="/supervision-centro/informe-particular/:idPersona"
            element={
              <RutaProtegida rolRequerido="jefe_centro">
                <InformePersonaParticular
                  tituloBarra="Panel de Supervisión (Jefe/a de Centro)"
                  rutaVolver="/supervision-centro"
                  textoVolver="← Volver al panel"
                />
              </RutaProtegida>
            }
          />

          {/* Resultados del GSHS por módulo (SCRUM-57), scopeado a la
              institución del psicólogo por RLS. */}
          <Route 
            path="/dashboard/gshs" 
            element={
              <RutaProtegida rolRequerido="psicologo">
                <IndicadoresGSHS />
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

          {/* Panel de la Docente Supervisora (cuenta única): lista de
              pasantes, detalle con calificación y los dos informes
              individuales (persona particular / estudiante) en modo
              solo lectura. */}
          <Route
            path="/supervision-pasantias"
            element={
              <RutaProtegida rolRequerido="docente_supervisora">
                <PanelSupervisora />
              </RutaProtegida>
            }
          />
          <Route
            path="/supervision-pasantias/pasante/:idPasante"
            element={
              <RutaProtegida rolRequerido="docente_supervisora">
                <DetallePasante />
              </RutaProtegida>
            }
          />
          <Route
            path="/supervision-pasantias/pasante/:idPasante/informe-particular/:idPersona"
            element={
              <RutaProtegida rolRequerido="docente_supervisora">
                <InformeParticularSupervisora />
              </RutaProtegida>
            }
          />
          <Route
            path="/supervision-pasantias/pasante/:idPasante/informe/:idPaciente"
            element={
              <RutaProtegida rolRequerido="docente_supervisora">
                <InformeEstudianteSupervisora />
              </RutaProtegida>
            }
          />

          {/* Comodín: cualquier URL que no coincida con ninguna ruta de
              arriba (typo, enlace viejo, o un enlace tipo
              /registro-docente/:codigo que todavía no existe -- ver
              comentario en RegistroDocente.jsx) cae acá en vez de
              renderizar una pantalla en blanco. */}
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </GuardianDeSesion>
    </>
  );
}

export default App;