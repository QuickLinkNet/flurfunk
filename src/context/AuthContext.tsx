import { createContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/authApi';
import type { OnboardingStep } from '../types/onboarding';
import type { User } from '../types/user';

interface RegisterInput {
  code: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, avatarUrl?: string | null) => Promise<User>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<User>;
  updateDigestPreference: (enabled: boolean) => Promise<User>;
  deleteMe: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  saveOnboardingProgress: (step: OnboardingStep) => Promise<void>;
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

  async function login(email: string, password: string, remember = true) {
    const loggedInUser = await authApi.login(email, password, remember);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(input: RegisterInput) {
    const registeredUser = await authApi.register(input);
    setUser(registeredUser);
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  async function updateProfile(displayName: string, avatarUrl?: string | null) {
    const updatedUser = await authApi.updateProfile(displayName, avatarUrl);
    setUser(updatedUser);
    return updatedUser;
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    const updatedUser = await authApi.updatePassword(currentPassword, newPassword);
    setUser(updatedUser);
    return updatedUser;
  }

  async function updateDigestPreference(enabled: boolean) {
    const updatedUser = await authApi.updateDigestPreference(enabled);
    setUser(updatedUser);
    return updatedUser;
  }

  async function deleteMe() {
    await authApi.deleteMe();
    setUser(null);
  }

  async function completeOnboarding() {
    setUser(await authApi.completeOnboarding());
  }

  async function saveOnboardingProgress(step: OnboardingStep) {
    setUser(await authApi.saveOnboardingProgress(step));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, updatePassword, updateDigestPreference, deleteMe, completeOnboarding, saveOnboardingProgress }}>
      {children}
    </AuthContext.Provider>
  );
}
