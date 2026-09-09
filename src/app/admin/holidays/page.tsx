"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi, apiErrorMessage } from "@/lib/api";

type Holiday = {
  id: number;
  date: string;
  name: string;
};

export default function AdminHolidaysPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <HolidaysContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function HolidaysContent() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    adminApi
      .get("/admin/holidays")
      .then(({ data }) => setHolidays(data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await adminApi.post("/admin/holidays", { date, name });
      setDate("");
      setName("");
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function remove(holiday: Holiday) {
    if (!confirm(`ลบวันหยุด "${holiday.name}"?`)) return;
    await adminApi.delete(`/admin/holidays/${holiday.id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">วันหยุดประจำปี</h1>
      <p className="mt-1 text-sm text-slate-400">
        วันที่กำหนดไว้ในนี้จะไม่นับเป็นวันขาด/สายในรายงาน แม้จะเป็นวันทำงานปกติก็ตาม
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            วันที่
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            ชื่อวันหยุด
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="เช่น วันสงกรานต์"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {creating ? "กำลังเพิ่ม..." : "+ เพิ่มวันหยุด"}
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">วันที่</th>
              <th className="px-5 py-3 font-medium">ชื่อวันหยุด</th>
              <th className="px-5 py-3 font-medium"></th>
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
            {!loading && holidays.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-slate-400">
                  ยังไม่มีวันหยุดที่กำหนดไว้
                </td>
              </tr>
            )}
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-700">
                  {dayjs(holiday.date).format("D MMMM YYYY")}
                </td>
                <td className="px-5 py-3 text-slate-500">{holiday.name}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => remove(holiday)}
                    className="text-xs font-medium text-red-600 underline"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
