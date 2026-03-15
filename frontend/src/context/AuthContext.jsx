import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Full-screen branded loading spinner — shown while auth state is being verified
function AppLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0B1420', gap: 16, fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(0,229,255,0.15)', borderTopColor: '#00E5FF',
        animation: 'spin 0.8s linear infinite', boxShadow: '0 0 20px rgba(0,229,255,0.3)',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#00E5FF', fontSize: 13, fontWeight: 700, letterSpacing: 2, opacity: 0.8 }}>
        SMARTFACTORY.AI
      </div>
      <div style={{ color: '#A0B3C6', fontSize: 11, letterSpacing: 1 }}>Initializing system...</div>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // 8-second timeout so a down/slow backend doesn't freeze the app forever
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const res = await api.get('/auth/me', { signal: controller.signal });
          clearTimeout(timer);
          setUser(res.data.user);
        } catch (err) {
          // Token invalid, backend down, or timeout → clear and redirect to login
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check if the server is running.');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {/* Show branded spinner while loading; never render raw blank screen */}
      {loading ? <AppLoader /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
