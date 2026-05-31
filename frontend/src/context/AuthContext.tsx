/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api';
import type { UserResponse } from '@/types/api';

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const ME_QUERY_KEY = ['auth', 'me'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    staleTime: Infinity,
    retry: false,
  });

  // Listen for 401s dispatched by the API layer
  useEffect(() => {
    const handler = () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login(email, password);
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    queryClient.setQueryData(ME_QUERY_KEY, null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
