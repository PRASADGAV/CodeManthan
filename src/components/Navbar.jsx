import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LuLogOut, LuZap, LuStar, LuFlame } from 'react-icons/lu';

export default function Navbar() {
  const { user, logout, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/student-dashboard': 'Student Dashboard',
      '/educator-dashboard': 'Educator Dashboard',
      '/quiz/select': 'Select Quiz',
      '/quiz/play': 'Quiz in Progress',
      '/quiz/result': 'Quiz Results',
      '/learning-path': 'AI Learning Path',
      '/leaderboard': 'Leaderboard',
      '/profile': 'Profile & Badges',
    };
    return titles[path] || 'CodeManthan';
  };

  return (
    <header className="navbar" id="main-navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-right">
        {isStudent && (
          <>
            <div className="navbar-xp" title="Experience Points">
              <LuZap className="xp-icon" />
              <span>{user?.xp || 0} XP</span>
            </div>
            <div className="navbar-level" title="Current Level">
              <LuStar />
              <span>Lv. {user?.level || 1}</span>
            </div>
            {user?.loginStreak > 0 && (
              <div className="navbar-streak" title="Login Streak">
                <LuFlame />
                <span>{user.loginStreak}d</span>
              </div>
            )}
          </>
        )}
        <button onClick={handleLogout} className="logout-btn" id="logout-btn">
          <LuLogOut />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
