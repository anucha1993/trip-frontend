"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/api";

type DailyRow = {
  employee_id: number;
  display_name: string;
  first_check_in: string | null;
  last_check_out: string | null;
  total_hours: number;
};

export default function AdminDashboardPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <DashboardContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function DashboardContent() {
  const today = dayjs().format("YYYY-MM-DD");
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [locationCount, setLocationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get("/admin/reports/daily", { params: { date: today } }),
      adminApi.get("/admin/employees", { params: { per_page: 1 } }),
      adminApi.get("/admin/locations"),
    ])
      .then(([daily, employees, locations]) => {
        setRows(daily.data.rows);
        setEmployeeCount(employees.data.total);
        setLocationCount(locations.data.length);
      })
      .finally(() => setLoading(false));
  }, [today]);

  const stillWorking = rows.filter(
    (r) => r.first_check_in && !r.last_check_out
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">แดชบอร์ด</h1>
      <p className="mt-1 text-sm text-slate-400">
        ภาพรวมวันที่ {dayjs(today).format("D MMMM YYYY")}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="พนักงานทั้งหมด" value={employeeCount} icon="👥" />
        <StatCard
          label="มาทำงานวันนี้"
          value={loading ? "-" : rows.length}
          icon="✅"
        />
        <StatCard
          label="กำลังปฏิบัติงาน"
          value={loading ? "-" : stillWorking}
          icon="🟢"
        />
        <StatCard label="จุดสแกน QR" value={locationCount} icon="📍" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">สรุปวันนี้</h2>
          <Link
            href="/admin/reports/daily"
            className="text-sm font-medium text-emerald-600 underline"
          >
            ดูรายงานเต็ม
          </Link>
        </div>

        {loading && <p className="text-sm text-slate-400">กำลังโหลด...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-slate-400">ยังไม่มีการลงเวลาวันนี้</p>
        )}
        {!loading && rows.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-2 font-medium">พนักงาน</th>
                <th className="pb-2 font-medium">เข้างาน</th>
                <th className="pb-2 font-medium">ออกงาน</th>
                <th className="pb-2 font-medium">ชั่วโมงทำงาน</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.employee_id} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-700">
                    {row.display_name}
                  </td>
                  <td className="py-2 text-slate-500">
                    {row.first_check_in
                      ? dayjs(row.first_check_in).format("HH:mm")
                      : "-"}
                  </td>
                  <td className="py-2 text-slate-500">
                    {row.last_check_out
                      ? dayjs(row.last_check_out).format("HH:mm")
                      : "-"}
                  </td>
                  <td className="py-2 text-slate-500">{row.total_hours} ชม.</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
