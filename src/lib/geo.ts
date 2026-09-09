/**
 * Best-effort geolocation read. Resolves to null (not a thrown error) if
 * unsupported, denied, or timed out — callers should still let the scan
 * request proceed; the backend enforces the geofence only for locations
 * configured with lat/lng/radius, and returns a clear error if coords are
 * required but missing.
 */
export function getCurrentPositionSafe(
  timeoutMs = 8000
): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs }
    );
  });
}

/**
 * Mandatory geolocation read for check-in/out — the system must always
 * record where the employee scanned. Rejects with a Thai message on denial/
 * timeout/unsupported browser so callers can block the scan entirely.
 */
export function requestCurrentPosition(
  timeoutMs = 10000
): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง กรุณาใช้เบราว์เซอร์อื่น"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error(
              "จำเป็นต้องอนุญาตการเข้าถึงตำแหน่งก่อนลงเวลา กรุณากด \"อนุญาต\" เมื่อเบราว์เซอร์ถาม แล้วลองใหม่"
            )
          );
        } else {
          reject(new Error("ไม่สามารถอ่านตำแหน่งได้ กรุณาลองใหม่อีกครั้ง"));
        }
      },
      { enableHighAccuracy: true, timeout: timeoutMs }
    );
  });
}
