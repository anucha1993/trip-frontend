"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi, apiErrorMessage } from "@/lib/api";

type Employee = {
  id: number;
  display_name: string;
  full_name: string | null;
};

type LeaveRequest = {
  id: number;
  date: string;
  type: "sick" | "personal" | "other";
  note: string | null;
  employee: Employee;
};

const typeLabels: Record<LeaveRequest["type"], string> = {
  sick: "ลาป่วย",
  personal: "ลากิจ",
  other: "อื่นๆ",
};

export default function AdminLeavesPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <LeavesContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function LeavesContent() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<LeaveRequest["type"]>("personal");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    adminApi
      .get("/admin/leaves")
      .then(({ data }) => setLeaves(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    adminApi
      .get("/admin/employees", { params: { per_page: 100 } })
      .then(({ data }) => setEmployees(data.data));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await adminApi.post("/admin/leaves", {
        employee_id: Number(employeeId),
        date,
        type,
        note: note || undefined,
      });
      setDate("");
      setNote("");
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function remove(leave: LeaveRequest) {
    if (!confirm(`ลบรายการลาของ "${leave.employee.display_name}"?`)) return;
    await adminApi.delete(`/admin/leaves/${leave.id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">การลางาน</h1>
      <p className="mt-1 text-sm text-slate-400">
        บันทึกวันลาของพนักงาน เพื่อไม่ให้นับเป็นวันขาดงานในรายงาน
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            พนักงาน
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="" disabled>
              เลือกพนักงาน
            </option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name || employee.display_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            วันที่ลา
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            ประเภท
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LeaveRequest["type"])}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="sick">ลาป่วย</option>
            <option value="personal">ลากิจ</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            หมายเหตุ (ถ้ามี)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {creating ? "กำลังบันทึก..." : "+ บันทึกการลา"}
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">พนักงาน</th>
              <th className="px-5 py-3 font-medium">วันที่ลา</th>
              <th className="px-5 py-3 font-medium">ประเภท</th>
              <th className="px-5 py-3 font-medium">หมายเหตุ</th>
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
            {!loading && leaves.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  ยังไม่มีข้อมูลการลา
                </td>
              </tr>
            )}
            {leaves.map((leave) => (
              <tr key={leave.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-700">
                  {leave.employee.full_name || leave.employee.display_name}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {dayjs(leave.date).format("D MMM YYYY")}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {typeLabels[leave.type]}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {leave.note || "-"}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => remove(leave)}
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
