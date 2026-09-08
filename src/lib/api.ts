import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1000/api";

const EMPLOYEE_TOKEN_KEY = "trip_employee_token";
const ADMIN_TOKEN_KEY = "trip_admin_token";

export function getEmployeeToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMPLOYEE_TOKEN_KEY);
}

export function setEmployeeToken(token: string) {
  window.localStorage.setItem(EMPLOYEE_TOKEN_KEY, token);
}

export function clearEmployeeToken() {
  window.localStorage.removeItem(EMPLOYEE_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export const employeeApi = axios.create({ baseURL: API_BASE_URL });
employeeApi.interceptors.request.use((config) => {
  const token = getEmployeeToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminApi = axios.create({ baseURL: API_BASE_URL });
adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0]?.[0];
      if (first) return first;
    }
    if (data?.message) return data.message;
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
