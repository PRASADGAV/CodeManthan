import { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  saveCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  seedDemoData,
} from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Seed demo data on first load
    seedDemoData();
    
    // Check for existing session
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    setError('');
    const result = loginUser(email, password);
    if (result.success) {
      setUser(result.user);
      return true;
    } else {
      setError(result.message);
      return false;
    }
  };

  const register = (userData) => {
    setError('');
    const result = registerUser(userData);
    if (result.success) {
      saveCurrentUser(result.user);
      setUser(result.user);
      return true;
    } else {
      setError(result.message);
      return false;
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    saveCurrentUser(updatedUser);
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isEducator: user?.role === 'educator',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
