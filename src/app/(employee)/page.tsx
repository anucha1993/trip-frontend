"use client";

import Link from "next/link";
import RequireEmployee from "@/components/employee/RequireEmployee";
import BottomNav from "@/components/employee/BottomNav";
import { useEmployeeAuth } from "@/context/EmployeeAuthContext";

export default function HomePage() {
  return (
    <RequireEmployee>
      <HomeContent />
    </RequireEmployee>
  );
}

function HomeContent() {
  const { employee, logout } = useEmployeeAuth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          {employee?.picture_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={employee.picture_url}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
              {employee?.display_name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400">สวัสดี</p>
            <p className="font-semibold text-slate-900">
              {employee?.display_name}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-xs font-medium text-slate-400 underline"
        >
          ออกจากระบบ
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-5 pb-6">
        <Link
          href="/scan"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-10 text-white shadow-lg shadow-emerald-200 transition active:scale-[0.98]"
        >
          <span className="text-5xl">📷</span>
          <span className="text-lg font-bold">สแกน QR เพื่อลงเวลา</span>
          <span className="text-xs text-emerald-100">
            แตะเพื่อเปิดกล้องสแกนที่จุดลงเวลา
          </span>
        </Link>

        <Link
          href="/history"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕘</span>
            <div>
              <p className="font-semibold text-slate-800">ประวัติการลงเวลา</p>
              <p className="text-xs text-slate-400">
                ดูรายการเข้า-ออกงานของฉัน
              </p>
            </div>
          </div>
          <span className="text-slate-300">›</span>
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
