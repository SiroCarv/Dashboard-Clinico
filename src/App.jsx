// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- MÓDULOS ---
// Autenticación
import Login from './modules/autenticacion/pages/Login';
import Registro from './modules/autenticacion/pages/Registro';
import RecuperarPassword from './modules/autenticacion/pages/RecuperarPassword';
import RestablecerPassword from './modules/autenticacion/pages/RestablecerPassword';

// Evaluaciones
import Encuesta from './modules/evaluaciones/pages/Encuesta';
// Dashboard
import Dashboard from './modules/dashboard_clinico/pages/Dashboard';
import DetalleClinico from './modules/dashboard_clinico/pages/DetalleClinico';
// Instituciones
import PanelMaestro from './modules/instituciones/pages/PanelMaestro';
// --- CORE ---
import RutaProtegida from './core/security/RutaProtegida';
import RutaPublica from './core/security/RutaPublica';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RutaPublica><Login /></RutaPublica>} />
      <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
      
      {/* Ruta dinámica para atrapar el código de la institución */}
      <Route path="/registro/:codigo" element={<RutaPublica><Registro /></RutaPublica>} />
      {/* Dejamos la ruta normal por si alguien entra sin código, para mostrarle un mensaje de error */}
      <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
      
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
        path="/dashboard/evaluacion/:idEvaluacion" 
        element={
          <RutaProtegida rolRequerido="psicologo">
            <DetalleClinico />
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
  );
}

export default App;