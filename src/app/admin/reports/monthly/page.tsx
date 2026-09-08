"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/api";

type MonthlyRow = {
  employee_id: number;
  display_name: string;
  days_present: number;
  total_hours: number;
};

export default function AdminMonthlyReportPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <MonthlyReportContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function MonthlyReportContent() {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [rows, setRows] = useState<MonthlyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .get("/admin/reports/monthly", { params: { month } })
      .then(({ data }) => setRows(data.rows))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            รายงานประจำเดือน
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            สรุปจำนวนวันทำงานและชั่วโมงรวมของแต่ละพนักงาน
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">พนักงาน</th>
              <th className="px-5 py-3 font-medium">จำนวนวันที่มาทำงาน</th>
              <th className="px-5 py-3 font-medium">ชั่วโมงทำงานรวม</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-slate-400">
                  กำลังโหลด...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-slate-400">
                  ไม่มีข้อมูลในเดือนนี้
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.employee_id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-700">
                  {row.display_name}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {row.days_present} วัน
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {row.total_hours} ชม.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
