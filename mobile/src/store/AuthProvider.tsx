import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((token) => {
      setIsLoggedIn(token !== null);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setIsLoggedIn(false);
  }, []);

  const getToken = useCallback(() => AsyncStorage.getItem(TOKEN_KEY), []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
