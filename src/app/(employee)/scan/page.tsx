"use client";

import { useEffect, useRef, useState } from "react";
import RequireEmployee from "@/components/employee/RequireEmployee";
import BottomNav from "@/components/employee/BottomNav";
import { apiErrorMessage, employeeApi } from "@/lib/api";
import { requestCurrentPosition } from "@/lib/geo";

type ScanResult = {
  status: "success" | "error";
  message: string;
  type?: "check_in" | "check_out";
  time?: string;
  location?: string;
};

export default function ScanPage() {
  return (
    <RequireEmployee>
      <ScanContent />
    </RequireEmployee>
  );
}

function ScanContent() {
  const readerId = "qr-reader";
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);

  async function requestLocation() {
    setRequestingLocation(true);
    setLocationError(null);
    try {
      const pos = await requestCurrentPosition();
      setPosition(pos);
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : "ไม่สามารถอ่านตำแหน่งได้");
    } finally {
      setRequestingLocation(false);
    }
  }

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!position) return;

    let cancelled = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          (decodedText) => handleDecoded(decodedText),
          () => {
            /* ignore per-frame scan failures */
          }
        );
        if (!cancelled) setScanning(true);
      } catch {
        if (!cancelled) {
          setCameraError(
            "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้องในเบราว์เซอร์"
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  async function handleDecoded(decodedText: string) {
    if (busyRef.current || !position) return;
    busyRef.current = true;

    try {
      await scannerRef.current?.pause(true);
    } catch {
      // ignore
    }

    try {
      const { data } = await employeeApi.post("/attendance/scan", {
        qr_token: decodedText,
        latitude: position.latitude,
        longitude: position.longitude,
      });
      setResult({
        status: "success",
        message: data.message,
        type: data.attendance.type,
        time: data.attendance.scanned_at,
        location: data.attendance.location,
      });
    } catch (error) {
      setResult({ status: "error", message: apiErrorMessage(error) });
    }
  }

  function scanAgain() {
    setResult(null);
    busyRef.current = false;
    scannerRef.current?.resume();
  }

  if (!position) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-3xl">📍</p>
        <h1 className="text-lg font-bold text-slate-900">
          ต้องอนุญาตการเข้าถึงตำแหน่งก่อนสแกน
        </h1>
        <p className="text-sm text-slate-500">
          ระบบต้องบันทึกตำแหน่งที่คุณลงเวลาทุกครั้ง กรุณากดอนุญาตเมื่อเบราว์เซอร์ถาม
        </p>
        {locationError && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {locationError}
          </p>
        )}
        <button
          onClick={requestLocation}
          disabled={requestingLocation}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
        >
          {requestingLocation
            ? "กำลังขอตำแหน่ง..."
            : locationError
              ? "ลองใหม่อีกครั้ง"
              : "📍 อนุญาตให้เข้าถึงตำแหน่ง"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pb-2 pt-6">
        <h1 className="text-lg font-bold text-slate-900">สแกน QR ลงเวลา</h1>
        <p className="text-xs text-slate-400">
          หันกล้องไปที่ QR Code ณ จุดลงเวลา
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center gap-4 px-5 pb-6">
        <div
          id={readerId}
          className="w-full max-w-sm overflow-hidden rounded-2xl bg-black"
        />

        {cameraError && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
            {cameraError}
          </p>
        )}

        {!scanning && !cameraError && (
          <p className="text-sm text-slate-400">กำลังเปิดกล้อง...</p>
        )}

        {result && (
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 text-center shadow-sm ${
              result.status === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p
              className={`text-3xl ${
                result.status === "success" ? "" : "grayscale"
              }`}
            >
              {result.status === "success"
                ? result.type === "check_in"
                  ? "✅"
                  : "🚪"
                : "⚠️"}
            </p>
            <p
              className={`mt-2 font-semibold ${
                result.status === "success"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {result.message}
            </p>
            {result.time && (
              <p className="mt-1 text-sm text-slate-500">
                {new Date(result.time).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {result.location}
              </p>
            )}
            <button
              onClick={scanAgain}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              สแกนอีกครั้ง
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
