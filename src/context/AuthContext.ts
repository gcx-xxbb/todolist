import { createContext } from 'react';

type AuthContextType = {
  user: { name: string } | null;
  login(name: string): void;
  logout(): void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
