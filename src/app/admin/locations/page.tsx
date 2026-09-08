"use client";

import { useEffect, useState } from "react";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi, apiErrorMessage } from "@/lib/api";

type Location = {
  id: number;
  name: string;
  address: string | null;
  is_active: boolean;
  qr_token: string;
  scan_url: string;
  qr_image_url: string;
};

export default function AdminLocationsPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <LocationsContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function LocationsContent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    adminApi
      .get("/admin/locations")
      .then(({ data }) => setLocations(data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await adminApi.post("/admin/locations", { name, address: address || undefined });
      setName("");
      setAddress("");
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(location: Location) {
    await adminApi.patch(`/admin/locations/${location.id}`, {
      is_active: !location.is_active,
    });
    load();
  }

  async function regenerate(location: Location) {
    if (!confirm(`สร้าง QR Code ใหม่สำหรับ "${location.name}"? QR เดิมจะใช้ไม่ได้อีกต่อไป`)) {
      return;
    }
    await adminApi.post(`/admin/locations/${location.id}/regenerate-token`);
    load();
  }

  async function remove(location: Location) {
    if (!confirm(`ลบจุดสแกน "${location.name}"?`)) return;
    await adminApi.delete(`/admin/locations/${location.id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">จุดสแกน QR</h1>
      <p className="mt-1 text-sm text-slate-400">
        สร้างจุดลงเวลาแล้วพิมพ์ QR Code ไปติดตั้งหน้างาน
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            ชื่อจุดสแกน
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            ที่อยู่ (ถ้ามี)
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {creating ? "กำลังสร้าง..." : "+ เพิ่มจุดสแกน"}
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-sm text-slate-400">กำลังโหลด...</p>}
        {!loading && locations.length === 0 && (
          <p className="text-sm text-slate-400">ยังไม่มีจุดสแกน</p>
        )}
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={location.qr_image_url}
              alt={`QR ${location.name}`}
              className="h-40 w-40"
            />
            <p className="mt-3 font-semibold text-slate-800">
              {location.name}
            </p>
            {location.address && (
              <p className="text-xs text-slate-400">{location.address}</p>
            )}
            <span
              className={`mt-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                location.is_active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {location.is_active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
            </span>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
              <a
                href={location.qr_image_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
              >
                พิมพ์ / ดาวน์โหลด
              </a>
              <button
                onClick={() => toggleActive(location)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
              >
                {location.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
              </button>
              <button
                onClick={() => regenerate(location)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
              >
                สร้าง QR ใหม่
              </button>
              <button
                onClick={() => remove(location)}
                className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
