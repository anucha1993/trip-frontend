"use client";

import { useEffect, useState } from "react";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi, apiErrorMessage } from "@/lib/api";

type Location = {
  id: number;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  radius_meters: number | null;
  is_active: boolean;
  qr_token: string;
  scan_url: string;
  qr_image_url: string;
};

type LocationForm = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radius_meters: string;
};

const emptyForm: LocationForm = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  radius_meters: "",
};

function useCurrentPosition() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function locate(onSuccess: (lat: number, lng: number) => void) {
    if (!navigator.geolocation) {
      setError("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("ไม่สามารถอ่านตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return { locate, locating, error };
}

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
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<LocationForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const createPosition = useCurrentPosition();
  const editPosition = useCurrentPosition();

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
      await adminApi.post("/admin/locations", {
        name: form.name,
        address: form.address || undefined,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        radius_meters: form.radius_meters || undefined,
      });
      setForm(emptyForm);
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

  function startEdit(location: Location) {
    setEditingId(location.id);
    setError(null);
    setEditForm({
      name: location.name,
      address: location.address ?? "",
      latitude: location.latitude ?? "",
      longitude: location.longitude ?? "",
      radius_meters: location.radius_meters?.toString() ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function saveEdit(location: Location) {
    setSaving(true);
    setError(null);
    try {
      await adminApi.patch(`/admin/locations/${location.id}`, {
        name: editForm.name,
        address: editForm.address || null,
        latitude: editForm.latitude || null,
        longitude: editForm.longitude || null,
        radius_meters: editForm.radius_meters || null,
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
      <h1 className="text-2xl font-bold text-slate-900">จุดสแกน QR</h1>
      <p className="mt-1 text-sm text-slate-400">
        สร้างจุดลงเวลาแล้วพิมพ์ QR Code ไปติดตั้งหน้างาน — ตั้งพิกัด + รัศมีได้ เพื่อจำกัดให้สแกนได้เฉพาะในพื้นที่จริงเท่านั้น
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              ชื่อจุดสแกน
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              ที่อยู่ (ถ้ามี)
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              ละติจูด
            </label>
            <input
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="เช่น 13.756331"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              ลองจิจูด
            </label>
            <input
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="เช่น 100.501765"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              รัศมีที่อนุญาต (เมตร)
            </label>
            <input
              value={form.radius_meters}
              onChange={(e) =>
                setForm({ ...form, radius_meters: e.target.value })
              }
              placeholder="เช่น 100"
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              createPosition.locate((lat, lng) =>
                setForm({
                  ...form,
                  latitude: lat.toFixed(7),
                  longitude: lng.toFixed(7),
                })
              )
            }
            disabled={createPosition.locating}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {createPosition.locating ? "กำลังอ่านตำแหน่ง..." : "📍 ใช้ตำแหน่งปัจจุบัน"}
          </button>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {creating ? "กำลังสร้าง..." : "+ เพิ่มจุดสแกน"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          ถ้าไม่กรอกพิกัด/รัศมี จุดนี้จะสแกนได้จากทุกที่ (ไม่จำกัดพื้นที่)
        </p>
        {createPosition.error && (
          <p className="mt-2 text-sm text-red-600">{createPosition.error}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
            <span className="mt-1 text-xs text-slate-400">
              {location.latitude && location.longitude && location.radius_meters
                ? `📍 จำกัดระยะ ${location.radius_meters} เมตร`
                : "🌐 ไม่จำกัดพื้นที่"}
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
                onClick={() =>
                  editingId === location.id ? cancelEdit() : startEdit(location)
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-emerald-600 hover:bg-slate-50"
              >
                {editingId === location.id ? "ยกเลิก" : "แก้ไขพิกัด"}
              </button>
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

            {editingId === location.id && (
              <div className="mt-4 w-full space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      ชื่อ
                    </label>
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      ที่อยู่
                    </label>
                    <input
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      ละติจูด
                    </label>
                    <input
                      value={editForm.latitude}
                      onChange={(e) =>
                        setEditForm({ ...editForm, latitude: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      ลองจิจูด
                    </label>
                    <input
                      value={editForm.longitude}
                      onChange={(e) =>
                        setEditForm({ ...editForm, longitude: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      รัศมี (ม.)
                    </label>
                    <input
                      value={editForm.radius_meters}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          radius_meters: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    editPosition.locate((lat, lng) =>
                      setEditForm({
                        ...editForm,
                        latitude: lat.toFixed(7),
                        longitude: lng.toFixed(7),
                      })
                    )
                  }
                  disabled={editPosition.locating}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-50"
                >
                  {editPosition.locating
                    ? "กำลังอ่านตำแหน่ง..."
                    : "📍 ใช้ตำแหน่งปัจจุบัน"}
                </button>
                {editPosition.error && (
                  <p className="text-xs text-red-600">{editPosition.error}</p>
                )}
                <button
                  onClick={() => saveEdit(location)}
                  disabled={saving}
                  className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกพิกัด"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
