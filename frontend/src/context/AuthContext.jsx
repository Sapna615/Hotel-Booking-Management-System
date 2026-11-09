import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hb_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync and verify current user on mount
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('hb_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: tokenData } = res.data;
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('hb_user', JSON.stringify(userData));
    localStorage.setItem('hb_token', tokenData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { user: userData, token: tokenData } = res.data;
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('hb_user', JSON.stringify(userData));
    localStorage.setItem('hb_token', tokenData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hb_user');
    localStorage.removeItem('hb_token');
  };

  // Quick 1-click demo login helper for reviewers
  const demoLogin = async (role) => {
    const credentials = {
      admin: { email: 'admin@hotel.demo', password: 'Admin@123' },
      staff: { email: 'staff@hotel.demo', password: 'Staff@123' },
      guest: { email: 'guest@hotel.demo', password: 'Guest@123' },
    };

    const creds = credentials[role];
    if (!creds) throw new Error('Invalid demo role');
    return login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
