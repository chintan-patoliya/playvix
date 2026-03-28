import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('playvix_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveAuth = useCallback((token, userData) => {
    localStorage.setItem('playvix_token', token);
    localStorage.setItem('playvix_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('playvix_token');
    localStorage.removeItem('playvix_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, saveAuth, clearAuth, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
