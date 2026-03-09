import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon, LayoutDashboard, List, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Tours from './pages/Tours';
import Calendar from './pages/Calendar';
import Login from './components/Login';
import { useState, useEffect } from 'react';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      localStorage.removeItem('currentUser');
      return null;
    }
  });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <BrowserRouter>
      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="app-layout">
          <aside className="sidebar">
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
            </nav>

            <div style={{ marginTop: isMobile ? '0' : 'auto', padding: isMobile ? '0.5rem' : '1rem' }}>
              <div
                onClick={handleLogout}
                title="Cerrar Sesión"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: isMobile ? '0.25rem' : '0.75rem 1rem',
                  backgroundColor: isMobile ? 'transparent' : 'var(--bg-hover)',
                  borderRadius: 'var(--radius-md)',
                  border: isMobile ? 'none' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseOver={(e) => {
                  if (!isMobile) e.currentTarget.style.backgroundColor = '#fef2f2'; // Very light red
                }}
                onMouseOut={(e) => {
                  if (!isMobile) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                  fontSize: '0.875rem'
                }}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
                </div>
                {!isMobile && (
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Cerrar Sesión</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentUser?.name}</div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Calendar currentUser={currentUser} />} />
              <Route path="/tours" element={<Tours currentUser={currentUser} />} />
              <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
