import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro'; // <-- Importa el nuevo componente
import Encuesta from './pages/Encuesta';
import Dashboard from './pages/Dashboard';
import RutaProtegida from './components/RutaProtegida';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} /> {/* <-- Añade esta línea */}
        <Route path="/encuesta" element={<Encuesta />} />
        
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