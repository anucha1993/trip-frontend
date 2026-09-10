# TIP168 Time Attandence — Frontend (Next.js)

หน้าเว็บสำหรับระบบลงเวลาเข้า-ออกงาน แบ่งเป็น 2 ส่วน:

- **ฝั่งพนักงาน** (`/`, `/login`, `/scan`, `/history`, ...) — mobile-first, ใช้บัญชี LINE login
  แล้วสแกน QR Code เพื่อลงเวลา
- **ฝั่ง SuperAdmin** (`/admin/...`) — desktop dashboard สำหรับจัดการพนักงาน, จุดสแกน QR
  และดูรายงานประจำวัน/ประจำเดือน

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- `axios` สำหรับเรียก API
- `html5-qrcode` สำหรับเปิดกล้องสแกน QR ในหน้าเว็บ
- `dayjs` สำหรับจัดรูปแบบวันเวลา

## การตั้งค่า (Setup)

```bash
npm install
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:1000/api
```

## รัน Dev Server

```bash
npm run dev
```

เปิดที่ [http://localhost:1001](http://localhost:1001) (ตั้ง port ไว้ที่ 1001 ให้ตรงกับค่า
`FRONTEND_URL` ที่ backend คาดหวังไว้สำหรับ redirect หลัง LINE Login และ CORS)

> ต้องรัน backend (Laravel) คู่กันที่ `http://localhost:1000` ก่อน มิฉะนั้น login/API จะไม่ทำงาน

## หน้าเว็บหลัก

| Path | คำอธิบาย |
| --- | --- |
| `/login` | ปุ่มเข้าสู่ระบบด้วย LINE |
| `/auth/callback` | รับ token จาก backend หลัง LINE login สำเร็จ |
| `/` | หน้าแรกพนักงาน (ต้อง login) |
| `/scan` | เปิดกล้องสแกน QR เพื่อลงเวลาเข้า-ออกงาน |
| `/checkin?token=...` | ปลายทางที่ QR Code จริงชี้ไป (กรณีสแกนด้วยกล้อง LINE/เครื่องทั่วไป) |
| `/history` | ประวัติการลงเวลาของตนเอง |
| `/admin/login` | เข้าสู่ระบบ SuperAdmin |
| `/admin` | แดชบอร์ดภาพรวม |
| `/admin/employees` | จัดการพนักงาน (เปิด/ปิดใช้งาน, ชื่อจริง/แผนก/ตำแหน่ง) |
| `/admin/locations` | สร้าง/จัดการจุดสแกน QR พร้อมพิมพ์ QR Code |
| `/admin/reports/daily` | รายงานประจำวัน |
| `/admin/reports/monthly` | รายงานประจำเดือน |
| `/admin/settings` | เปลี่ยนรหัสผ่าน SuperAdmin |

## Deploy บน Plesk (Node.js / Passenger hosting)

โปรเจกต์นี้มีไฟล์ `server.js` ที่ root ไว้ให้แล้ว สำหรับ host ที่ต้องการไฟล์ startup แบบธรรมดา
(เช่น Plesk's Passenger) แทนที่จะเรียก `next start` โดยตรง

1. อัปโหลดโค้ดทั้งโฟลเดอร์ขึ้นเซิร์ฟเวอร์ (เช่น `httpdocs/`)
2. ตั้งค่า **Custom environment variables** ใน Plesk ให้มี `NEXT_PUBLIC_API_URL` ชี้ไป backend จริง
   — **ต้องตั้งค่านี้ก่อน build** เพราะ Next.js ฝังค่า `NEXT_PUBLIC_*` ตอน build ไม่ใช่ตอนรัน
3. กด **NPM install**
4. กด **Run script** → รัน `npm run build`
5. ตั้ง **Application Startup File** เป็น `server.js` (อยู่ที่ root ของโปรเจกต์ ไม่ใช่ path ซ้อนโฟลเดอร์)
6. กด **Restart App**

Passenger จะเซ็ต `PORT` ให้อัตโนมัติ ซึ่ง `server.js` อ่านจาก `process.env.PORT` อยู่แล้ว
