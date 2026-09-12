import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { loginUser, registerUser, fetchCurrentUser, updateUserProfile } from '../api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
  }) => Promise<void>;
  logout: () => void;
  quickDemoLogin: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ansh_cart_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await fetchCurrentUser();
          setUser(profile);
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('ansh_cart_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    localStorage.setItem('ansh_cart_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
  }) => {
    const res = await registerUser(data);
    localStorage.setItem('ansh_cart_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const quickDemoLogin = async () => {
    await login('ansh@anshcart.com', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('ansh_cart_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const updated = await updateUserProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
