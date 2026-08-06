// Punto de entrada de la aplicación. Monta <App /> dentro de un
// BrowserRouter (habilita las rutas de react-router-dom en toda la app)
// y StrictMode (ayuda de React en desarrollo para detectar efectos
// secundarios inseguros; no afecta la build de producción).
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
