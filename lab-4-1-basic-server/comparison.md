# Comparison — Node.js HTTP Core vs Express.js

> โฟกัส: งาน Lab 4.1 (Students API) ที่ทำเหมือนกันทั้งสองฝั่ง  
> เปรียบเทียบด้านโค้ดจริง การดูแลรักษา ประสิทธิภาพ และการต่อยอด

---

## 1) Routing & โครงสร้างโค้ด
**HTTP Core**
- เขียน router เอง: แยก `pathname`, split เป็น `parts`, if/else ตามเส้นทาง
- โค้ดละเอียด เห็นกลไกทั้งหมด (learning value สูง) แต่ยาวและซ้ำง่าย

**Express**
- ใช้ declarative routes: `app.get('/path', handler)`
- โค้ดสั้น อ่านง่าย จัดกลุ่ม route ได้ดี (แยกไฟล์/แยกโมดูลง่าย)

**สรุป:** งานเล็ก/สอนพื้นฐาน → HTTP Core ดีมาก, งานจริง/โตเร็ว → Express คุ้มเวลา

---

## 2) Parsing: Query, Params, Body
**HTTP Core**
- Query: `url.parse(req.url, true).query`
- Params: ต้องแตก path เอง (`/students/:id` → `parts[1]`)
- Body JSON (เมธอด POST/PUT): ต้องอ่าน `req.on('data')` + `JSON.parse()` เอง (ใน lab ไม่ได้ใช้ฝั่ง http core)

**Express**
- Query: `req.query`
- Params: `req.params.id`
- Body: `express.json()` ใช้ได้ทันที

**สรุป:** Express ลดภาระโค้ดซ้ำซ้อนและบั๊ก parsing จุกจิก

---

## 3) Error Handling & 404
**HTTP Core**
- เขียน helper เอง (`notFound`, `methodNotAllowed`, try/catch รอบใหญ่)
- ต้องระวังไม่ให้หลุด `throw` โดยไม่ตอบกลับ

**Express**
- มี middleware 404 & error handler มาตรฐาน
- รวม log/error stack ได้เป็นระบบ

**สรุป:** Express มีรางวิ่งกลาง (convention) ให้จัดการข้อผิดพลาดเรียบร้อยกว่า

---

## 4) CORS & Headers
**HTTP Core**
- ตั้ง header เองทุกจุด (เช่น `Access-Control-Allow-Origin`, preflight `OPTIONS`)

**Express**
- ทำเองได้เหมือนกัน หรือใช้ `cors` middleware ได้ใน 1 บรรทัด

**สรุป:** Express สะดวกกว่าเมื่อ scale header/policy หลายจุด

---

## 5) Performance & Footprint
**HTTP Core**
- เบาสุด ไม่มี overhead ของ framework
- เหมาะงาน ultra-minimal หรือ service เฉพาะทาง

**Express**
- มี overhead เล็กน้อย แต่สำหรับงานทั่วไปผลต่างไม่ใช่คอขวด
- ได้ productivity/maintainability แลก overhead เล็กน้อย

**สรุป:** ถ้าไม่ใช่ระบบ ultra-high-performance เฟรมเวิร์กช่วยชีวิตมากกว่า

---

## 6) Maintainability & Scale
**HTTP Core**
- เมื่อ route เพิ่ม ความซับซ้อนพุ่งเร็ว (if/else/switch ซ้อน)
- แยกไฟล์/โมดูลได้ แต่ต้องออกแบบเองทั้งหมด

**Express**
- โครงสร้างแอปชัด (router แยกไฟล์, middleware ต่อชั้น)
- ชุมชน/ตัวอย่าง/ปลั๊กอินเยอะ (auth, rate-limit, validation ฯลฯ)

**สรุป:** ระยะยาว Express บริหารโค้ดง่ายกว่า

---

## 7) DX (Developer Experience)
**HTTP Core**
- สอนเข้าใจ “พื้นฐาน HTTP” ชัด (ดีมากสำหรับการเรียนรู้)

**Express**
- พัฒนาเร็ว, อ่านง่าย, onboard เพื่อนร่วมทีมไว
- ecosystem ช่วยงาน (morgan/logger, helmet/security, joi/validator)

**สรุป:** ใช้ Express เพื่อโฟกัสที่ business logic

---

## 8) ความปลอดภัย (Security Basics)
- ทั้งสองแบบ: ต้องตั้ง header/validation เอง
- Express ทำได้เร็วกว่า เช่น `helmet` ชุดเดียวได้หลาย security headers
- Validation: HTTP core ต้องเขียนเอง / Express ใช้ `express-validator` หรือ `zod/joi` ได้รวดเร็ว

---

## 9) การตั้งค่า/สภาพแวดล้อม (Config)
- ทั้งสองแบบ: ใช้ `process.env` ได้เหมือนกัน (PORT, NODE_ENV)
- Express: จัดแบ่งไฟล์ config/middleware/route ได้เป็นสัดส่วนกว่า

---

## 10) ตัวอย่างเปรียบเทียบสั้น ๆ

**HTTP Core (แนวคิด)**  
```js
const { pathname, query } = url.parse(req.url, true);
const parts = pathname.split('/').filter(Boolean);
if (parts[0] === 'students' && parts.length === 1) {
  // /students (+ ?year=)
}

---

## 11) เมื่อไหร่ควรเลือกอะไร?

- สถานการณ์	แนะนำ
- วิชาเรียน/เดโมพื้นฐาน HTTP, เข้าใจกลไกต่ำสุด	HTTP Core
- ทำ API ที่โตได้, หลายเส้นทาง, ทีมหลายคน	Express
- จุดบริการเฉพาะ, ultra-light endpoint	HTTP Core
- ต้องการ middleware/ปลั๊กอิน/แนวทางมาตรฐาน	Express

---

## 12) Pitfalls ที่พบบ่อย

HTTP Core: ลืมตั้ง header, ลืม return ทำให้ตอบซ้ำ, พลาด decode URI, โค้ด route พองเร็ว

Express: ลืม return หลัง res.json(), ลืม next(err), ลืมวาง 404 handler ท้ายสุด, ไม่ล็อกเวอร์ชันแพ็กเกจ

---

## 13) บทสรุป

ถ้าจุดประสงค์คือ “เข้าใจแกนของ HTTP/Node” → ใช้ HTTP Core จะเห็นภาพครบ

ถ้าจุดประสงค์คือ “สร้าง API ใช้งานจริง/ส่งต่องานทีม” → Express ชนะเรื่องความเร็วในการพัฒนา โครงสร้าง และ ecosystem

ใน Lab นี้ ทั้งสองแบบทำงานได้เท่ากัน แต่ Express ให้ “ประสบการณ์พัฒนา” ที่สบายกว่าและต่อยอดง่ายกว่าในโปรเจกต์จริง