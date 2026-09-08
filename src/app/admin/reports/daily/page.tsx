"use client";

import { Fragment, useEffect, useState } from "react";
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
  events: { type: string; scanned_at: string; location: string | null }[];
};

export default function AdminDailyReportPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <DailyReportContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function DailyReportContent() {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .get("/admin/reports/daily", { params: { date } })
      .then(({ data }) => setRows(data.rows))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            รายงานประจำวัน
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            สรุปเวลาเข้า-ออกงานรายวันของพนักงานแต่ละคน
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">พนักงาน</th>
              <th className="px-5 py-3 font-medium">เข้างานครั้งแรก</th>
              <th className="px-5 py-3 font-medium">ออกงานครั้งสุดท้าย</th>
              <th className="px-5 py-3 font-medium">ชั่วโมงทำงานรวม</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  กำลังโหลด...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  ไม่มีข้อมูลในวันนี้
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <Fragment key={row.employee_id}>
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-700">
                    {row.display_name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {row.first_check_in
                      ? dayjs(row.first_check_in).format("HH:mm")
                      : "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {row.last_check_out
                      ? dayjs(row.last_check_out).format("HH:mm")
                      : "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {row.total_hours} ชม.
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() =>
                        setExpanded(
                          expanded === row.employee_id ? null : row.employee_id
                        )
                      }
                      className="text-xs font-medium text-emerald-600 underline"
                    >
                      {expanded === row.employee_id ? "ซ่อน" : "รายละเอียด"}
                    </button>
                  </td>
                </tr>
                {expanded === row.employee_id && (
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td colSpan={5} className="px-5 py-3">
                      <ul className="space-y-1 text-xs text-slate-500">
                        {row.events.map((event, idx) => (
                          <li key={idx}>
                            {event.type === "check_in" ? "เข้า" : "ออก"} —{" "}
                            {dayjs(event.scanned_at).format("HH:mm")} (
                            {event.location ?? "-"})
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
