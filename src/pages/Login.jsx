import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuMail, LuLock, LuArrowRight, LuCircleAlert } from 'react-icons/lu';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern"></div>
      <div className="auth-bg-glow"></div>

      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <div className="logo-icon-landing">🧠</div>
          <span className="logo-text-landing">CodeManthan</span>
        </Link>

        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your learning journey</p>
          </div>

          {error && (
            <div className="auth-error">
              <LuCircleAlert />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <LuMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="input-field input-with-icon"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <LuLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  className="input-field input-with-icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" id="login-submit">
              Sign In
              <LuArrowRight />
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>

          <div className="auth-demo">
            <p className="auth-demo-title">Quick Demo Access</p>
            <div className="demo-accounts">
              <button className="demo-btn" onClick={() => { setEmail('alice@demo.com'); setPassword('demo123'); }}>
                🎓 Student (Alice)
              </button>
              <button className="demo-btn" onClick={() => { setEmail('prof@demo.com'); setPassword('demo123'); }}>
                🏫 Educator (Prof.)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
