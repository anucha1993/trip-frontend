"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setEmployeeToken } from "@/lib/api";
import { useEmployeeAuth } from "@/context/EmployeeAuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useEmployeeAuth();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (!token) {
      setFailed(true);
      return;
    }

    setEmployeeToken(token);
    refresh().then(() => {
      const pendingToken = window.sessionStorage.getItem(
        "pending_checkin_token"
      );
      if (pendingToken) {
        window.sessionStorage.removeItem("pending_checkin_token");
        router.replace(`/checkin?token=${encodeURIComponent(pendingToken)}`);
      } else {
        router.replace("/");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-slate-500">เข้าสู่ระบบไม่สำเร็จ</p>
        <button
          onClick={() => router.replace("/login")}
          className="text-sm font-medium text-emerald-600 underline"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center text-slate-400">
      กำลังเข้าสู่ระบบ...
    </div>
  );
}
