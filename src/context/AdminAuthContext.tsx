"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  adminApi,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/lib/api";

export type Admin = {
  id: number;
  name: string;
  username: string;
};

type AdminAuthContextValue = {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await adminApi.get<Admin>("/admin/me");
      setAdmin(data);
    } catch {
      clearAdminToken();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await adminApi.post("/admin/login", {
      username,
      password,
    });
    setAdminToken(data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.post("/admin/logout");
    } catch {
      // ignore network errors on logout
    }
    clearAdminToken();
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
