import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon, LayoutDashboard, List, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Tours from './pages/Tours';

import Calendar from './pages/Calendar';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          {/* Logo removido según instrucciones */}
          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarIcon size={20} />
              Calendario
            </NavLink>
            <NavLink to="/tours" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <List size={20} />
              Gestión
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Operativa
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              Configuración
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/settings" element={<Settings />} /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
