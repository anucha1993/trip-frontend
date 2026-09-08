"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireEmployee from "@/components/employee/RequireEmployee";
import BottomNav from "@/components/employee/BottomNav";
import { employeeApi } from "@/lib/api";

type Attendance = {
  id: number;
  type: "check_in" | "check_out";
  work_date: string;
  scanned_at: string;
  location: { name: string } | null;
};

export default function HistoryPage() {
  return (
    <RequireEmployee>
      <HistoryContent />
    </RequireEmployee>
  );
}

function HistoryContent() {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    employeeApi
      .get("/attendance/history", { params: { month, per_page: 100 } })
      .then(({ data }) => setRecords(data.data))
      .finally(() => setLoading(false));
  }, [month]);

  const grouped = records.reduce<Record<string, Attendance[]>>((acc, r) => {
    const day = dayjs(r.work_date).format("YYYY-MM-DD");
    acc[day] = acc[day] ? [...acc[day], r] : [r];
    return acc;
  }, {});

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pb-3 pt-6">
        <h1 className="text-lg font-bold text-slate-900">ประวัติการลงเวลา</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
        />
      </header>

      <main className="flex-1 space-y-4 px-5 pb-6">
        {loading && <p className="text-sm text-slate-400">กำลังโหลด...</p>}

        {!loading && records.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            ไม่มีข้อมูลในเดือนนี้
          </p>
        )}

        {Object.entries(grouped)
          .sort((a, b) => (a[0] < b[0] ? 1 : -1))
          .map(([day, events]) => (
            <div
              key={day}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="mb-2 text-sm font-semibold text-slate-700">
                {dayjs(day).format("D MMM YYYY")}
              </p>
              <ul className="space-y-1.5">
                {events
                  .slice()
                  .sort((a, b) => (a.scanned_at < b.scanned_at ? -1 : 1))
                  .map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span>
                          {event.type === "check_in" ? "✅ เข้างาน" : "🚪 ออกงาน"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {event.location?.name}
                        </span>
                      </span>
                      <span className="font-medium text-slate-600">
                        {dayjs(event.scanned_at).format("HH:mm")}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
      </main>

      <BottomNav />
    </div>
  );
}
