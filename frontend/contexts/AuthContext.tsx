import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, removeToken } from '../service/storage';
import api from '../api/axios';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_USER' | 'ADMIN' | 'CLIENT';
}

interface AuthContextProps {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (token) {
        try {
          const res = await api.get('/users/profile');
          const userData = res.data as AuthUser;
          setUser(userData);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
