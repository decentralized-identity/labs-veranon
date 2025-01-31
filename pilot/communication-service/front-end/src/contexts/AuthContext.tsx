import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../constants/urls';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isVerified: boolean;
  checkVerification: (serviceProviderId: string, accountId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const navigate = useNavigate();

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${BACKEND_URL}/protected`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          logout();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      }
    };

    verifyToken();
  }, [token]);

  const checkVerification = async (serviceProviderId: string, accountId: number) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/verify?serviceProviderId=${serviceProviderId}&accountId=${accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.isVerified);
      }
    } catch (error) {
      console.error('Verification check failed:', error);
      setIsVerified(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      isVerified,
      checkVerification 
    }}>
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