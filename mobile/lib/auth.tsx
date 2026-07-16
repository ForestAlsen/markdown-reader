import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const storedUser = await SecureStore.getItemAsync('user');
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    await SecureStore.setItemAsync('authToken', res.accessToken);
    await SecureStore.setItemAsync('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (
    username: string,
    password: string,
    email?: string,
  ) => {
    const res = await api.register(username, password, email);
    await SecureStore.setItemAsync('authToken', res.accessToken);
    await SecureStore.setItemAsync('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
