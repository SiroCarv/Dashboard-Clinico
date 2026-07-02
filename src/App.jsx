import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Encuesta from './pages/Encuesta';
import Dashboard from './pages/Dashboard';
import RutaProtegida from './components/RutaProtegida';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/encuesta" element={<Encuesta />} />
        
        {/* Aquí blindamos la ruta del Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <RutaProtegida rolRequerido="psicologo">
              <Dashboard />
            </RutaProtegida>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;