import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = [
  { id: 'u001', email: 'admin@factory.com', password: 'admin123', name: 'Rajesh Kumar', role: 'Admin', avatar: 'RK' },
  { id: 'u002', email: 'manager@factory.com', password: 'manager123', name: 'Kavya Iyer', role: 'Manager', avatar: 'KI' },
  { id: 'u003', email: 'worker@factory.com', password: 'worker123', name: 'Arjun Sharma', role: 'Worker', avatar: 'AS' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 'u001', email: 'admin@factory.com', name: 'Rajesh Kumar', role: 'Admin', avatar: 'RK' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 800)); // simulate API call
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      setLoading(false);
      return true;
    } else {
      setError('Invalid email or password');
      setLoading(false);
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
