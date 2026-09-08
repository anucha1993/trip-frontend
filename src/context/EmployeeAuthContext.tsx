"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  API_BASE_URL,
  clearEmployeeToken,
  employeeApi,
  getEmployeeToken,
} from "@/lib/api";

export type Employee = {
  id: number;
  display_name: string;
  picture_url: string | null;
  role: string;
};

type EmployeeAuthContextValue = {
  employee: Employee | null;
  loading: boolean;
  loginWithLine: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const EmployeeAuthContext = createContext<EmployeeAuthContextValue | null>(
  null
);

export function EmployeeAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getEmployeeToken();
    if (!token) {
      setEmployee(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await employeeApi.get<Employee>("/me");
      setEmployee(data);
    } catch {
      clearEmployeeToken();
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginWithLine = useCallback(() => {
    window.location.href = `${API_BASE_URL}/auth/line/redirect`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await employeeApi.post("/logout");
    } catch {
      // ignore network errors on logout
    }
    clearEmployeeToken();
    setEmployee(null);
  }, []);

  return (
    <EmployeeAuthContext.Provider
      value={{ employee, loading, loginWithLine, logout, refresh }}
    >
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth() {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) {
    throw new Error(
      "useEmployeeAuth must be used within an EmployeeAuthProvider"
    );
  }
  return ctx;
}
