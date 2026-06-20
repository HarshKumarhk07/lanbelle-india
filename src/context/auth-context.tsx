"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import type { SessionUser } from "@/types";

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
  setUser: (user: SessionUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const ME_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ME_KEY,
    queryFn: () => apiGet<{ user: SessionUser | null }>("/auth/me"),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const setUser = React.useCallback(
    (user: SessionUser | null) => {
      queryClient.setQueryData(ME_KEY, { user });
    },
    [queryClient],
  );

  const logout = React.useCallback(async () => {
    await apiPost("/auth/logout");
    setUser(null);
    queryClient.clear();
  }, [queryClient, setUser]);

  const user = data?.user ?? null;

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refetch,
      setUser,
      logout,
    }),
    [user, isLoading, refetch, setUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
