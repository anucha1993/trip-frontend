"use client";

import { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi, apiErrorMessage } from "@/lib/api";

type Employee = {
  id: number;
  display_name: string;
  full_name: string | null;
  employee_code: string | null;
  department: string | null;
  position: string | null;
  picture_url: string | null;
  email: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

type EditForm = {
  employee_code: string;
  full_name: string;
  department: string;
  position: string;
};

const emptyForm: EditForm = {
  employee_code: "",
  full_name: "",
  department: "",
  position: "",
};

export default function AdminEmployeesPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <EmployeesContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    adminApi
      .get("/admin/employees", { params: { search: search || undefined } })
      .then(({ data }) => setEmployees(data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleActive(employee: Employee) {
    await adminApi.patch(`/admin/employees/${employee.id}`, {
      is_active: !employee.is_active,
    });
    load();
  }

  async function removeEmployee(employee: Employee) {
    if (
      !confirm(
        `ลบข้อมูลพนักงาน "${employee.display_name}" ถาวร? ประวัติการลงเวลาของพนักงานคนนี้จะถูกลบไปด้วย และไม่สามารถกู้คืนได้`
      )
    ) {
      return;
    }
    await adminApi.delete(`/admin/employees/${employee.id}`);
    load();
  }

  function startEdit(employee: Employee) {
    setEditingId(employee.id);
    setError(null);
    setForm({
      employee_code: employee.employee_code ?? "",
      full_name: employee.full_name ?? "",
      department: employee.department ?? "",
      position: employee.position ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function saveEdit(employee: Employee) {
    setSaving(true);
    setError(null);
    try {
      await adminApi.patch(`/admin/employees/${employee.id}`, {
        employee_code: form.employee_code || null,
        full_name: form.full_name || null,
        department: form.department || null,
        position: form.position || null,
      });
      cancelEdit();
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">พนักงาน</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ, รหัสพนักงาน, แผนก..."
          className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">พนักงาน (LINE)</th>
              <th className="px-5 py-3 font-medium">ชื่อ-สกุล / รหัส</th>
              <th className="px-5 py-3 font-medium">แผนก / ตำแหน่ง</th>
              <th className="px-5 py-3 font-medium">เข้าสู่ระบบล่าสุด</th>
              <th className="px-5 py-3 font-medium">สถานะ</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  กำลังโหลด...
                </td>
              </tr>
            )}
            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  ไม่พบพนักงาน
                </td>
              </tr>
            )}
            {employees.map((employee) => (
              <Fragment key={employee.id}>
                <tr className="border-t border-slate-100">
                  <td className="flex items-center gap-3 px-5 py-3">
                    {employee.picture_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={employee.picture_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {employee.display_name[0]}
                      </div>
                    )}
                    <span className="font-medium text-slate-700">
                      {employee.display_name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    <p className="font-medium text-slate-700">
                      {employee.full_name || "-"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {employee.employee_code || "ไม่มีรหัสพนักงาน"}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    <p>{employee.department || "-"}</p>
                    <p className="text-xs text-slate-400">
                      {employee.position || ""}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {employee.last_login_at
                      ? dayjs(employee.last_login_at).format("D MMM YYYY HH:mm")
                      : "-"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        employee.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {employee.is_active ? "ใช้งานอยู่" : "ระงับการใช้งาน"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() =>
                        editingId === employee.id
                          ? cancelEdit()
                          : startEdit(employee)
                      }
                      className="mr-3 text-xs font-medium text-emerald-600 underline"
                    >
                      {editingId === employee.id ? "ยกเลิก" : "แก้ไขข้อมูล"}
                    </button>
                    <button
                      onClick={() => toggleActive(employee)}
                      className="mr-3 text-xs font-medium text-slate-500 underline"
                    >
                      {employee.is_active ? "ระงับ" : "เปิดใช้งาน"}
                    </button>
                    <button
                      onClick={() => removeEmployee(employee)}
                      className="text-xs font-medium text-red-600 underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
                {editingId === employee.id && (
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500">
                            รหัสพนักงาน
                          </label>
                          <input
                            value={form.employee_code}
                            onChange={(e) =>
                              setForm({ ...form, employee_code: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500">
                            ชื่อ-สกุลจริง
                          </label>
                          <input
                            value={form.full_name}
                            onChange={(e) =>
                              setForm({ ...form, full_name: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500">
                            แผนก
                          </label>
                          <input
                            value={form.department}
                            onChange={(e) =>
                              setForm({ ...form, department: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500">
                            ตำแหน่ง
                          </label>
                          <input
                            value={form.position}
                            onChange={(e) =>
                              setForm({ ...form, position: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => saveEdit(employee)}
                          disabled={saving}
                          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {saving ? "กำลังบันทึก..." : "บันทึก"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600"
                        >
                          ยกเลิก
                        </button>
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
