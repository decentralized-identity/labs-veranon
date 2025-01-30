import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard'); // Redirect to protected route after login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  // Verify token on mount and when token changes
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3000/protected', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token is invalid
          logout();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      }
    };

    verifyToken();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 