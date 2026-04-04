import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuLogOut, LuZap, LuStar, LuFlame, LuMenu } from 'react-icons/lu';

const PAGE_TITLES = {
  '/student-dashboard': 'Student Dashboard',
  '/educator-dashboard': 'Educator Dashboard',
  '/quiz/select': 'Select Quiz',
  '/quiz/play': 'Quiz',
  '/quiz/result': 'Quiz Results',
  '/learning-path': 'Learning Path',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Profile & Badges',
  '/pdf-quiz': 'PDF Quiz',
  '/dashboard': 'Dashboard',
  '/resume-builder': 'Resume Builder',
  '/portfolio': 'Portfolio Builder',
};

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const title = PAGE_TITLES[location.pathname] || 'CodeManthan';
  const isStudent = user?.role === 'student';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger-btn" onClick={onMenuToggle} id="hamburger-menu-btn">
          <LuMenu />
        </button>
        <h2 className="navbar-title">{title}</h2>
      </div>

      <div className="navbar-right">
        {isStudent && (
          <>
            <div className="navbar-stat" style={{ color: '#fbbf24' }}>
              <LuZap /> {user?.xp || 0} XP
            </div>
            <div className="navbar-stat" style={{ color: '#10b981' }}>
              <LuStar /> Lv. {user?.level || 1}
            </div>
          </>
        )}
        <button className="logout-btn" onClick={handleLogout} id="logout-btn">
          <LuLogOut /> Logout
        </button>
      </div>
    </header>
  );
}
