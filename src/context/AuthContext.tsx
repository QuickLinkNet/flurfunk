import { createContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/authApi';
import type { User } from '../types/user';

interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  inviteCode: string;
  householdName: string;
  addressLine: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const loggedInUser = await authApi.login(email, password);
    setUser(loggedInUser);
  }

  async function register(input: RegisterInput) {
    const registeredUser = await authApi.register(input);
    setUser(registeredUser);
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>;
}
