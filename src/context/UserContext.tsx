import React, { createContext, useContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = {
  id: 'mock-user-002',
  name: 'Casey Traveler',
  email: 'casey.traveler@example.com',
};

interface UserContextValue {
  user: User;
}

const UserContext = createContext<UserContextValue>({ user: mockUser });

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <UserContext.Provider value={{ user: mockUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
