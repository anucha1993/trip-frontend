"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

const navItems = [
  { href: "/admin", label: "แดชบอร์ด", icon: "📊" },
  { href: "/admin/employees", label: "พนักงาน", icon: "👥" },
  { href: "/admin/locations", label: "จุดสแกน QR", icon: "📍" },
  { href: "/admin/reports/daily", label: "รายงานประจำวัน", icon: "📅" },
  { href: "/admin/reports/monthly", label: "รายงานประจำเดือน", icon: "🗓️" },
  { href: "/admin/holidays", label: "วันหยุดประจำปี", icon: "🎌" },
  { href: "/admin/leaves", label: "การลางาน", icon: "📝" },
  { href: "/admin/settings", label: "ตั้งค่า", icon: "⚙️" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-6">
          <p className="text-lg font-bold text-slate-900">Trip Attendance</p>
          <p className="text-xs text-slate-400">SuperAdmin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-800">{admin?.name}</p>
          <p className="text-xs text-slate-400">@{admin?.username}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
