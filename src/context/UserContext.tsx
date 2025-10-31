import React, { createContext, useContext } from 'react';

import { supabaseConfig } from '../services/supabaseClient';

export interface User {
  id: string;
  name: string;
}

const mockUser: User = {
  id: 'mock-user-002',
  name: 'Casey Traveler',
};

const supabaseDemoUser: User = {
  id: 'u1',
  name: 'User',
};

interface UserContextValue {
  user: User;
}

const defaultUser = supabaseConfig.isConfigured ? supabaseDemoUser : mockUser;

const UserContext = createContext<UserContextValue>({ user: defaultUser });

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <UserContext.Provider value={{ user: defaultUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
