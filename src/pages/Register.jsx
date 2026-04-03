import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuUser, LuMail, LuLock, LuArrowRight, LuCircleAlert, LuGraduationCap, LuUsers } from 'react-icons/lu';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    classCode: '',
  });
  const [formError, setFormError] = useState('');
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const success = register(formData);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <div className="logo-icon-landing">🧠</div>
          <span className="logo-text-landing">CodeManthan</span>
        </Link>

        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Start your personalized learning journey</p>
          </div>

          {(error || formError) && (
            <div className="auth-error">
              <LuCircleAlert />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                id="role-student"
              >
                <LuGraduationCap />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'educator' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'educator' }))}
                id="role-educator"
              >
                <LuUsers />
                <span>Educator</span>
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <LuUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input-field input-with-icon"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-email">Email</label>
              <div className="input-wrapper">
                <LuMail className="input-icon" />
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  className="input-field input-with-icon"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-form-row">
              <div className="input-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-wrapper">
                  <LuLock className="input-icon" />
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    className="input-field input-with-icon"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-wrapper">
                  <LuLock className="input-icon" />
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    className="input-field input-with-icon"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="classCode">Class Code (Optional)</label>
              <input
                type="text"
                id="classCode"
                name="classCode"
                className="input-field"
                placeholder="Enter class code to join a class"
                value={formData.classCode}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" id="register-submit">
              Create Account
              <LuArrowRight />
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
