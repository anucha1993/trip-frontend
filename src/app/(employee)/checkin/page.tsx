"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useEmployeeAuth } from "@/context/EmployeeAuthContext";
import { apiErrorMessage, employeeApi } from "@/lib/api";

type ScanResult = {
  status: "success" | "error";
  message: string;
  type?: "check_in" | "check_out";
  time?: string;
  location?: string;
};

export default function CheckinPage() {
  return (
    <Suspense fallback={null}>
      <CheckinContent />
    </Suspense>
  );
}

function CheckinContent() {
  const { employee, loading } = useEmployeeAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.replace("/");
      return;
    }

    if (!employee) {
      window.sessionStorage.setItem("pending_checkin_token", token);
      router.replace("/login");
      return;
    }

    setSubmitting(true);
    employeeApi
      .post("/attendance/scan", { qr_token: token })
      .then(({ data }) => {
        setResult({
          status: "success",
          message: data.message,
          type: data.attendance.type,
          time: data.attendance.scanned_at,
          location: data.attendance.location,
        });
      })
      .catch((error) => {
        setResult({ status: "error", message: apiErrorMessage(error) });
      })
      .finally(() => setSubmitting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, employee, token]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      {submitting && <p className="text-slate-400">กำลังลงเวลา...</p>}

      {result && (
        <div
          className={`w-full max-w-sm rounded-2xl border p-6 shadow-sm ${
            result.status === "success"
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="text-4xl">
            {result.status === "success"
              ? result.type === "check_in"
                ? "✅"
                : "🚪"
              : "⚠️"}
          </p>
          <p
            className={`mt-2 text-lg font-semibold ${
              result.status === "success" ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {result.message}
          </p>
          {result.time && (
            <p className="mt-1 text-sm text-slate-500">
              {new Date(result.time).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {result.location}
            </p>
          )}
          <button
            onClick={() => router.replace("/")}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white"
          >
            กลับหน้าแรก
          </button>
        </div>
      )}
    </div>
  );
}
