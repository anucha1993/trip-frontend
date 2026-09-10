"use client";

import { useEffect, useState } from "react";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi, apiErrorMessage } from "@/lib/api";

const weekdayOptions = [
  { value: 0, label: "อาทิตย์" },
  { value: 1, label: "จันทร์" },
  { value: 2, label: "อังคาร" },
  { value: 3, label: "พุธ" },
  { value: 4, label: "พฤหัสบดี" },
  { value: 5, label: "ศุกร์" },
  { value: 6, label: "เสาร์" },
];

export default function AdminSettingsPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <SettingsContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function SettingsContent() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">ตั้งค่า</h1>
      <p className="mt-1 text-sm text-slate-400">
        จัดการบัญชี SuperAdmin และกฎเวลาทำงานของระบบ
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WorkTimeSettingsForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}

type WorkSettings = {
  shift_start_time: string;
  shift_end_time: string;
  late_grace_minutes: number;
  weekly_off_day: number;
  alt_saturday_enabled: boolean;
  alternate_scan_mode: boolean;
  min_scan_interval_minutes: number;
};

function WorkTimeSettingsForm() {
  const [settings, setSettings] = useState<WorkSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .get("/admin/work-settings")
      .then(({ data }) =>
        setSettings({
          shift_start_time: data.shift_start_time.slice(0, 5),
          shift_end_time: data.shift_end_time.slice(0, 5),
          late_grace_minutes: data.late_grace_minutes,
          weekly_off_day: data.weekly_off_day,
          alt_saturday_enabled: data.alt_saturday_enabled,
          alternate_scan_mode: data.alternate_scan_mode,
          min_scan_interval_minutes: data.min_scan_interval_minutes,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await adminApi.put("/admin/work-settings", settings);
      setSuccess("บันทึกการตั้งค่าเวลาทำงานแล้ว");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold text-slate-800">ตั้งค่าเวลาเข้า-ออกงาน</h2>
      <p className="mt-1 text-xs text-slate-400">
        ใช้คำนวณสถานะ มาปกติ / มาสาย / ขาด และวันหยุดประจำสัปดาห์ในรายงาน
      </p>

      {loading && <p className="mt-4 text-sm text-slate-400">กำลังโหลด...</p>}

      {settings && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                เวลาเข้างาน
              </label>
              <input
                type="time"
                value={settings.shift_start_time}
                onChange={(e) =>
                  setSettings({ ...settings, shift_start_time: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                เวลาออกงาน
              </label>
              <input
                type="time"
                value={settings.shift_end_time}
                onChange={(e) =>
                  setSettings({ ...settings, shift_end_time: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              ผ่อนผันสาย (นาที)
            </label>
            <input
              type="number"
              min={0}
              max={180}
              value={settings.late_grace_minutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  late_grace_minutes: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              เข้างานหลังเวลานี้ (รวมผ่อนผัน) ถือว่า &quot;มาสาย&quot;
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              วันหยุดประจำสัปดาห์
            </label>
            <select
              value={settings.weekly_off_day}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  weekly_off_day: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {weekdayOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={settings.alt_saturday_enabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alt_saturday_enabled: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            เปิดใช้ &quot;เสาร์เว้เสาร์&quot; (เสาร์แรกของเดือนทำงานเสมอ สลับหยุด-ทำงานทุกสัปดาห์)
          </label>

          <div className="border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.alternate_scan_mode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    alternate_scan_mode: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              เปิดใช้โหมดสลับเข้า-ออกทุกครั้งที่สแกน (สำหรับพักเที่ยง/ออกนอกสถานที่หลายรอบ)
            </label>
            <p className="mt-1 text-xs text-slate-400">
              ค่าเริ่มต้น (ปิดอยู่): สแกนครั้งแรกของวันคือ &quot;เข้า&quot; เสมอ
              และทุกครั้งหลังจากนั้นคือ &quot;ออก&quot; เสมอ ไม่ว่าจะสแกนกี่ครั้งก็ตาม —
              ถ้าเปิดใช้ จะสลับเข้า/ออกทุกครั้งที่สแกนแทน
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              ระยะห่างขั้นต่ำระหว่างการสแกน (นาที)
            </label>
            <input
              type="number"
              min={0}
              max={180}
              value={settings.min_scan_interval_minutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  min_scan_interval_minutes: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              ถ้าสแกนถี่กว่านี้ ระบบจะปฏิเสธและแจ้งให้รอ (0 = ไม่จำกัด) ป้องกันสแกนซ้ำโดยไม่ตั้งใจ
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !settings}
        className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const { data } = await adminApi.post("/admin/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setSuccess(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold text-slate-800">เปลี่ยนรหัสผ่าน</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              รหัสผ่านปัจจุบัน
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">อย่างน้อย 8 ตัวอักษร</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
        </button>
      </form>
  );
}
