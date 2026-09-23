import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Importamos nuestros componentes
import ABMProfesores from './ABMProfesores';
import ABMCatedras from './ABMCatedras';
import PerfilProfesor from './PerfilProfesor';
import Inicio from './Inicio'; // Lo crearemos en el siguiente paso

export default function App() {
  return (
    <BrowserRouter>
      {/* Barra de navegación temporal para desarrollo */}
      <nav style={{ 
        padding: '15px 20px', 
        background: '#111', 
        display: 'flex', 
        gap: '20px',
        fontFamily: 'sans-serif'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🏠</Link>
        <Link to="/abm-profesores" style={{ color: '#ccc', textDecoration: 'none' }}>Profesores</Link>
        <Link to="/abm-catedras" style={{ color: '#ccc', textDecoration: 'none' }}>Cátedras</Link>
      </nav>

      {/* Definición de las URLs (Rutas) */}
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/abm-profesores" element={<ABMProfesores />} />
          <Route path="/abm-catedras" element={<ABMCatedras />} />
          
          {/* Ruta dinámica: El ":id" atrapa el código del profesor y se lo pasa a PerfilProfesor */}
          <Route path="/profesor/:id" element={<PerfilProfesor />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}