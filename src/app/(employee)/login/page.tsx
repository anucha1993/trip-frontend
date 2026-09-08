"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useEmployeeAuth } from "@/context/EmployeeAuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { employee, loading, loginWithLine } = useEmployeeAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!loading && employee) {
      router.replace("/");
    }
  }, [loading, employee, router]);

  const errorMessage =
    error === "account_disabled"
      ? "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
      : error === "line_auth_failed"
        ? "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        : null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-3xl text-white shadow-lg shadow-emerald-200">
          ⏱️
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Trip Time Attendance
        </h1>
        <p className="text-sm text-slate-500">
          สแกน QR Code เพื่อลงเวลาเข้า-ออกงาน
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        onClick={loginWithLine}
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#06C755] px-5 py-3 font-semibold text-white shadow-md shadow-emerald-200 transition hover:brightness-95 active:scale-[0.98]"
      >
        <span className="text-lg">💬</span>
        เข้าสู่ระบบด้วย LINE
      </button>

      <p className="max-w-xs text-xs text-slate-400">
        ระบบใช้บัญชี LINE ของคุณในการยืนยันตัวตนเท่านั้น
        ไม่ต้องสมัครสมาชิกใหม่
      </p>
    </div>
  );
}
