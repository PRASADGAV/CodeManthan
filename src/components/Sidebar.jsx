import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuTrophy,
  LuRoute,
  LuUser,
  LuUsers,
  LuGraduationCap,
  LuMenu,
  LuX,
} from 'react-icons/lu';

export default function Sidebar() {
  const { user, isStudent, isEducator } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = isStudent ? [
    { section: 'MAIN', items: [
      { to: '/student-dashboard', icon: <LuLayoutDashboard />, label: 'Dashboard' },
      { to: '/quiz/select', icon: <LuBookOpen />, label: 'Take Quiz' },
      { to: '/learning-path', icon: <LuRoute />, label: 'Learning Path', badge: 'AI' },
    ]},
    { section: 'COMMUNITY', items: [
      { to: '/leaderboard', icon: <LuTrophy />, label: 'Leaderboard' },
      { to: '/profile', icon: <LuUser />, label: 'Profile & Badges' },
    ]},
  ] : [
    { section: 'MAIN', items: [
      { to: '/educator-dashboard', icon: <LuLayoutDashboard />, label: 'Dashboard' },
    ]},
    { section: 'COMMUNITY', items: [
      { to: '/leaderboard', icon: <LuTrophy />, label: 'Leaderboard' },
      { to: '/profile', icon: <LuUser />, label: 'Profile' },
    ]},
  ];

  return (
    <>
      {/* Mobile menu button - rendered in navbar area via CSS */}
      <button className="mobile-menu-btn sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? <LuX /> : <LuMenu />}
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`} id="main-sidebar">
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-logo" onClick={() => setOpen(false)}>
            <div className="logo-icon">🧠</div>
            <span className="logo-text">CodeManthan</span>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`nav-item ${isActive(item.to) ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.avatar || '🧑‍🎓'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{user?.role || 'student'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
