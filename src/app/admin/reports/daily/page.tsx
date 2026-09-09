"use client";

import { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/api";

type Status =
  | "present"
  | "late"
  | "absent"
  | "leave"
  | "holiday"
  | "weekly_off"
  | "alt_saturday_off";

type DailyRow = {
  employee_id: number;
  employee_code: string | null;
  display_name: string;
  full_name: string | null;
  status: Status;
  first_check_in: string | null;
  last_check_out: string | null;
  total_hours: number;
  events: { type: string; scanned_at: string; location: string | null }[];
};

const statusStyles: Record<Status, string> = {
  present: "bg-emerald-50 text-emerald-700",
  late: "bg-amber-50 text-amber-700",
  absent: "bg-red-50 text-red-600",
  leave: "bg-sky-50 text-sky-700",
  holiday: "bg-slate-100 text-slate-500",
  weekly_off: "bg-slate-100 text-slate-500",
  alt_saturday_off: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<Status, string> = {
  present: "มาปกติ",
  late: "มาสาย",
  absent: "ขาดงาน",
  leave: "ลา",
  holiday: "วันหยุด",
  weekly_off: "วันหยุดประจำสัปดาห์",
  alt_saturday_off: "เสาร์หยุด",
};

type DayType = "working" | "weekly_off" | "alt_saturday_off" | "holiday";

const dayTypeLabels: Record<DayType, string> = {
  working: "วันทำงานปกติ",
  weekly_off: "วันหยุดประจำสัปดาห์",
  alt_saturday_off: "วันเสาร์หยุด (เสาร์เว้เสาร์)",
  holiday: "วันหยุด",
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
  const [dayType, setDayType] = useState<DayType>("working");
  const [holidayName, setHolidayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .get("/admin/reports/daily", { params: { date } })
      .then(({ data }) => {
        setRows(data.rows);
        setDayType(data.day_type);
        setHolidayName(data.holiday_name);
      })
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

      {dayType !== "working" && (
        <p className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">
          วันนี้เป็น{holidayName ? `วันหยุด: ${holidayName}` : dayTypeLabels[dayType]}{" "}
          — จะไม่นับขาด/สายสำหรับพนักงานทุกคน
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">พนักงาน</th>
              <th className="px-5 py-3 font-medium">ชื่อ-สกุล / รหัส</th>
              <th className="px-5 py-3 font-medium">สถานะ</th>
              <th className="px-5 py-3 font-medium">เข้างานครั้งแรก</th>
              <th className="px-5 py-3 font-medium">ออกงานครั้งสุดท้าย</th>
              <th className="px-5 py-3 font-medium">ชั่วโมงทำงานรวม</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                  กำลังโหลด...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                  ไม่มีพนักงานในระบบ
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
                    <p>{row.full_name || "-"}</p>
                    <p className="text-xs text-slate-400">
                      {row.employee_code || "-"}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`}
                    >
                      {statusLabels[row.status]}
                    </span>
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
                    <td colSpan={7} className="px-5 py-3">
                      {row.events.length === 0 && (
                        <p className="text-xs text-slate-400">
                          ไม่มีการสแกนเข้า-ออกในวันนี้
                        </p>
                      )}
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
