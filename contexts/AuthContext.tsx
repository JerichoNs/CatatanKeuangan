import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, ApiError, getToken, removeToken, saveToken } from "../services/api";

// --- Types ------------------------------------------------------------------
type AppUser = {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
};

type AuthContextType = {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "@catatan_keuangan_user";

// --- Provider ----------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Coba restore session dari AsyncStorage saat app pertama buka
  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          getToken(),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (token && userJson) {
          setUser(JSON.parse(userJson));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistUser = async (token: string, userData: AppUser) => {
    await saveToken(token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AppUser }>(
      "/auth/login",
      { email, password },
      false
    );
    await persistUser(res.token, res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<{ token: string; user: AppUser }>(
      "/auth/register",
      { name, email, password, password_confirmation: password },
      false
    );
    await persistUser(res.token, res.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // token mungkin sudah expired, tidak masalah
    }
    await removeToken();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await api.post("/auth/forgot-password", { email }, false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.is_admin ?? false,
        loading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

// Terjemahkan error API ke pesan yang user-friendly
export function translateApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Email atau password salah.";
    if (error.status === 422 && error.errors) {
      const first = Object.values(error.errors)[0]?.[0];
      if (first) return first;
    }
    if (error.status === 0)  return "Tidak ada koneksi internet.";
    return error.message || "Terjadi kesalahan, coba lagi.";
  }
  return "Terjadi kesalahan, coba lagi.";
}
