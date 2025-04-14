import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log("AuthContext: Found token, fetching profile...");
          const response = await api.get('/user/profile');
          setUser(response.data);
          setIsAuthenticated(true);
          console.log("AuthContext: Profile fetched, user authenticated.");
        } catch (error) {
          console.error('AuthContext: Failed to fetch profile with token:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log("AuthContext: No token found.");
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    setIsLoading(true);
    try {
      console.log("AuthContext: Logging in, fetching profile...");
      const response = await api.get('/user/profile');
      setUser(response.data);
      setIsAuthenticated(true);
      console.log("AuthContext: Login successful, profile fetched.");
    } catch (error) {
      console.error('AuthContext: Failed to fetch profile after login:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out.");
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading Authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 