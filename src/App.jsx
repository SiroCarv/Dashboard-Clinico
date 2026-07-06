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
// Instituciones
import PanelMaestro from './modules/instituciones/pages/PanelMaestro';
// --- CORE ---
import RutaProtegida from './core/security/RutaProtegida';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      
      {/* NUEVO: Ruta dinámica para atrapar el código de la institución */}
      <Route path="/registro/:codigo" element={<Registro />} />
      {/* Dejamos la ruta normal por si alguien entra sin código, para mostrarle un mensaje de error */}
      <Route path="/registro" element={<Registro />} />
      
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
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