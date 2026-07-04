import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Encuesta from './pages/Encuesta';
import Dashboard from './pages/Dashboard';
import RutaProtegida from './components/RutaProtegida';
import RecuperarPassword from './pages/RecuperarPassword';
import RestablecerPassword from './pages/RestablecerPassword';

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
    </Routes>
  );
}

export default App;