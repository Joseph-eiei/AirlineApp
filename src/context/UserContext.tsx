import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AuthUser, loginUser, signupUser } from '../api/auth';

export interface User {
  id: string;
  name: string;
  username: string;
}

type UserStatus = 'checking' | 'ready';

interface UserContextValue {
  user: User | null;
  status: UserStatus;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SESSION_KEY = '@airlineapp:user-session';

const mapAuthUser = (authUser: AuthUser): User => ({
  id: authUser.id,
  username: authUser.username,
  name: authUser.username,
});

const defaultContext: UserContextValue = {
  user: null,
  status: 'checking',
  authLoading: false,
  login: async () => undefined,
  signup: async () => undefined,
  logout: async () => undefined,
};

const UserContext = createContext<UserContextValue>(defaultContext);

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<UserStatus>('checking');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as User;
          setUser(parsed);
        }
      } catch (error) {
        console.warn('Failed to load user session', error);
      } finally {
        setStatus('ready');
      }
    };

    loadSession();
  }, []);

  const persistUser = useCallback(async (value: User | null) => {
    if (!value) {
      await AsyncStorage.removeItem(SESSION_KEY);
      return;
    }

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(value));
  }, []);

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      setAuthLoading(true);
      try {
        const authUser = await loginUser(username, password);
        const mapped = mapAuthUser(authUser);
        await persistUser(mapped);
        setUser(mapped);
      } finally {
        setAuthLoading(false);
      }
    },
    [persistUser],
  );

  const handleSignup = useCallback(
    async (username: string, password: string) => {
      setAuthLoading(true);
      try {
        const authUser = await signupUser(username, password);
        const mapped = mapAuthUser(authUser);
        await persistUser(mapped);
        setUser(mapped);
      } finally {
        setAuthLoading(false);
      }
    },
    [persistUser],
  );

  const handleLogout = useCallback(async () => {
    setAuthLoading(true);
    try {
      await persistUser(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [persistUser]);

  const value = useMemo(
    () => ({
      user,
      status,
      authLoading,
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
    }),
    [user, status, authLoading, handleLogin, handleSignup, handleLogout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
