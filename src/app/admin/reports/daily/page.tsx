"use client";

import { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi, downloadFile } from "@/lib/api";

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
  events: {
    id: number;
    type: string;
    scanned_at: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    is_manual: boolean;
    note: string | null;
  }[];
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
  alt_saturday_off: "วันเสาร์หยุด (เสาร์เว้นเสาร์)",
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
  const [exporting, setExporting] = useState(false);
  const [manualFormFor, setManualFormFor] = useState<number | null>(null);
  const [manualType, setManualType] = useState<"check_in" | "check_out">(
    "check_in"
  );
  const [manualTime, setManualTime] = useState("08:00");
  const [manualNote, setManualNote] = useState("");
  const [manualSaving, setManualSaving] = useState(false);

  function loadReport() {
    setLoading(true);
    return adminApi
      .get("/admin/reports/daily", { params: { date } })
      .then(({ data }) => {
        setRows(data.rows);
        setDayType(data.day_type);
        setHolidayName(data.holiday_name);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function openManualForm(employeeId: number) {
    setManualFormFor(employeeId);
    setManualType("check_in");
    setManualTime("08:00");
    setManualNote("");
  }

  async function submitManual(employeeId: number) {
    setManualSaving(true);
    try {
      await adminApi.post("/admin/attendance", {
        employee_id: employeeId,
        type: manualType,
        scanned_at: `${date} ${manualTime}:00`,
        note: manualNote || undefined,
      });
      setManualFormFor(null);
      await loadReport();
    } finally {
      setManualSaving(false);
    }
  }

  async function deleteManual(id: number) {
    if (!confirm("ลบรายการที่เพิ่มด้วยมือนี้?")) return;
    await adminApi.delete(`/admin/attendance/${id}`);
    await loadReport();
  }

  async function handleExport() {
    setExporting(true);
    try {
      await downloadFile(
        "/admin/reports/daily/export",
        { date },
        `daily-report-${date}.csv`
      );
    } finally {
      setExporting(false);
    }
  }

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
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting ? "กำลังส่งออก..." : "📥 ส่งออก Excel"}
          </button>
        </div>
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
                        {row.events.map((event) => (
                          <li key={event.id}>
                            {dayjs(event.scanned_at).format("HH:mm")} (
                            {event.location ?? "-"})
                            {event.latitude !== null && event.longitude !== null ? (
                              <>
                                {" "}
                                <a
                                  href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 underline"
                                >
                                  📍 {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
                                </a>
                              </>
                            ) : (
                              <span className="ml-1 text-red-500">(ไม่มีพิกัด)</span>
                            )}
                            {event.is_manual && (
                              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                ✍️ เพิ่มเอง ({event.type === "check_in" ? "เข้า" : "ออก"})
                              </span>
                            )}
                            {event.note && (
                              <span className="ml-2 italic text-slate-400">
                                &quot;{event.note}&quot;
                              </span>
                            )}
                            {event.is_manual && (
                              <button
                                onClick={() => deleteManual(event.id)}
                                className="ml-2 text-red-500 underline"
                              >
                                ลบ
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 border-t border-slate-200 pt-3">
                        {manualFormFor === row.employee_id ? (
                          <div className="flex flex-wrap items-end gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-400">
                                ประเภท
                              </label>
                              <select
                                value={manualType}
                                onChange={(e) =>
                                  setManualType(
                                    e.target.value as "check_in" | "check_out"
                                  )
                                }
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                              >
                                <option value="check_in">เข้างาน</option>
                                <option value="check_out">ออกงาน</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400">
                                เวลา
                              </label>
                              <input
                                type="time"
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                              />
                            </div>
                            <div className="min-w-[180px] flex-1">
                              <label className="block text-[11px] text-slate-400">
                                หมายเหตุ (เช่น ไปหน้างานโดยตรง)
                              </label>
                              <input
                                type="text"
                                value={manualNote}
                                onChange={(e) => setManualNote(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
                              />
                            </div>
                            <button
                              onClick={() => submitManual(row.employee_id)}
                              disabled={manualSaving}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                            >
                              {manualSaving ? "กำลังบันทึก..." : "บันทึก"}
                            </button>
                            <button
                              onClick={() => setManualFormFor(null)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-500"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openManualForm(row.employee_id)}
                            className="text-xs font-medium text-emerald-600 underline"
                          >
                            ✍️ เพิ่มบันทึกเวลาด้วยมือ
                          </button>
                        )}
                      </div>
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
