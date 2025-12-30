import { createContext } from 'react';

type AuthContextType = {
  user: { name: string; password: string } | null;
  login(name: string, password: string): void;
  logout(): void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
