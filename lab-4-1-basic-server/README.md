# Lab 4.1 — Students API (One-File Version)

โปรเจกต์นี้รวม **2 โหมดในไฟล์เดียว** (`server.js`)  
- **HTTP core** (ใช้ `http` module ล้วน)  
- **Express** (ใช้เฟรมเวิร์ก Express)

ฟีเจอร์หลัก:
- รายชื่อนักศึกษา / ดูรายคน
- ค้นหาตามสาขาแบบ **contains** (`/students/major/:major`)
- กรองตามปีการศึกษา `?year=3`
- จัดการ 404 / 400 และ CORS
- (โหมด Express) มี `/stats` สรุปสถิติ

---

## โครงสร้างโปรเจกต์

lab-4-1-basic-server/
├─ server.js
├─ package.json
├─ .gitignore
└─ README.md

> หากยังไม่มี `package.json` ให้รัน `npm init -y` ก่อน

---

## การติดตั้ง

ต้องมี Node.js ≥ 18  
สำหรับโหมด Express ต้องติดตั้ง express ก่อน:
```bash
npm i express

---

## การรัน

โหมด Express (ดีฟอลต์) — พอร์ต 3001
node server.js
# หรือ
node server.js express
# หรือกำหนดพอร์ต
PORT=5000 node server.js express

โหมด HTTP core — พอร์ต 3000
node server.js http
# หรือกำหนดพอร์ต
PORT=4000 node server.js http


Windows PowerShell ตั้งตัวแปรชั่วคราวแบบนี้:

$env:PORT=5000; node .\server.js express

---

Endpoints

โหมด HTTP core (เริ่มที่ http://localhost:3000)
Method	Path	คำอธิบาย
GET	/	ข้อความต้อนรับ + รายการ endpoints
GET	/students	รายชื่อทั้งหมด (รองรับ ?year=3)
GET	/students/:id	ข้อมูลนักศึกษาตาม ID
GET	/students/major/:major	ค้นหาตามสาขาแบบ contains (ไม่สนตัวพิมพ์)
*	อื่นๆ	404 JSON { error: "Not Found" }
โหมด Express (เริ่มที่ http://localhost:3001)
Method	Path	คำอธิบาย
GET	/	ข้อความต้อนรับ + รายการ endpoints
GET	/students	รายชื่อทั้งหมด (รองรับ ?year=3)
GET	/students/:id	ข้อมูลนักศึกษาตาม ID
GET	/students/major/:major	ค้นหาตามสาขาแบบ contains
GET	/stats	สถิติจำนวนนักศึกษา รวม/แยกตามสาขา
*	อื่นๆ	404 JSON { error: "Not Found" }

ทดสอบด้วย Postman 

---

เปิดเซิร์ฟเวอร์ (ตามโหมดที่ต้องการ)

สร้าง Environment:

baseUrlHttp = http://localhost:3000

baseUrlExpress = http://localhost:3001

สร้างคำขอ GET ตามตารางด้านบน และเพิ่ม Tests ง่ายๆ เช่น:

pm.test("200 OK", () => pm.response.code === 200);
const j = pm.response.json();
pm.test("มีฟิลด์ data หรือ endpoints", () => j.data || j.endpoints);

---