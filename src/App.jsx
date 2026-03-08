import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon, LayoutDashboard, List, Settings, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Tours from './pages/Tours';
import Calendar from './pages/Calendar';
import Configuracion from './pages/Configuracion';
import Login from './components/Login';
import { useState, useEffect } from 'react';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
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

          <div style={{ marginTop: 'auto', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {currentUser.name.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{currentUser.role === 'admin' ? 'Admin' : 'Chofer'}</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Calendar currentUser={currentUser} />} />
            <Route path="/tours" element={<Tours currentUser={currentUser} />} />
            <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/settings" element={<Configuracion currentUser={currentUser} onLogout={handleLogout} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
