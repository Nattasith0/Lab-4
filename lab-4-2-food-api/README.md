# 🍜 Lab 4.2 – Food API

## 🎯 เป้าหมาย
สร้าง RESTful API สำหรับรายการอาหาร โดยสามารถ  
- แสดง / ค้นหา / กรอง / เรียงลำดับ / แบ่งหน้า  
- แสดงรายละเอียดอาหารรายรายการ  
- ดึงอาหารตามหมวดหมู่  
- สุ่มอาหารแบบ random  
- แสดงสถิติข้อมูลอาหาร  
- พร้อมหน้าเว็บ HTML สำหรับทดสอบ API  

---

## 📁 โครงสร้างโปรเจกต์
lab-4-2-food-api/
├── package.json
├── README.md
├── server.js
├── middleware/
│ └── logger.js
├── routes/
│ └── foods.js
├── data/
│ └── foods.json
└── public/
└── index.html


---

## ⚙️ การติดตั้งและใช้งาน
```bash
npm install
npm run start   # หรือ npm run dev (ถ้ามี nodemon)
เปิดใช้งานที่:
👉 http://localhost:3000

🧩 Endpoints หลัก
1. /api/foods – แสดงรายการอาหารทั้งหมด
รองรับ query parameters สำหรับค้นหา / กรอง / เรียงลำดับ / แบ่งหน้า

พารามิเตอร์	คำอธิบาย	ตัวอย่าง
search	ค้นหาจากชื่อหรือคำอธิบาย	?search=ผัด
category	กรองตามประเภท	?category=dessert
vegetarian	อาหารมังสวิรัติ true / false	?vegetarian=true
available	กรองเฉพาะอาหารที่พร้อมเสิร์ฟ	?available=true
minPrice	ราคาต่ำสุด	?minPrice=40
maxPrice	ราคาสูงสุด	?maxPrice=100
maxSpicy	ความเผ็ดไม่เกิน (0–5)	?maxSpicy=2
sort	เรียงลำดับ: name, price, spicy	?sort=price
order	ลำดับ asc / desc	?order=desc
page	หน้าเริ่มที่ 1	?page=2
limit	จำนวนต่อหน้า (สูงสุด 100)	?limit=5

🧪 ตัวอย่าง

bash
คัดลอกโค้ด
/api/foods?category=dessert&maxPrice=80&sort=price&order=asc
/api/foods?vegetarian=true&page=2&limit=5
/api/foods?minPrice=40&maxPrice=80&sort=spicy&order=desc
2. /api/foods/:id
ดูรายละเอียดอาหารตาม id
เช่น: /api/foods/1

3. /api/foods/category/:category
ดูอาหารเฉพาะหมวด เช่น
/api/foods/category/drink

4. /api/foods/random
ดึงอาหารแบบสุ่ม 1 รายการ
รองรับ ?category= เพื่อสุ่มในหมวดเดียวกัน
เช่น: /api/foods/random?category=main

📊 /api/stats
แสดงสถิติโดยรวมของเมนูอาหาร

Response ตัวอย่าง

json
คัดลอกโค้ด
{
  "total": 10,
  "byCategory": { "main": 3, "dessert": 2, "drink": 2 },
  "vegetarian": { "true": 5, "false": 5 },
  "price": { "min": 35, "max": 110, "avg": 70.4 },
  "bySpicyLevel": { "0": 4, "2": 3, "3": 1 },
  "lastUpdated": "2025-10-08T12:30:00.000Z"
}
📖 /api/docs
เอกสารแนะนำการใช้งาน API ทั้งหมด (auto-generated)
เปิดดูได้ที่:
👉 http://localhost:3000/api/docs

🧠 /health
เช็คสถานะการทำงานของเซิร์ฟเวอร์
Response: { "status": "ok" }

🧰 Middleware
middleware/logger.js
บันทึกทุก request ที่เข้ามา เช่น:

sql
คัดลอกโค้ด
GET /api/foods?search=ผัด -> 200 (15ms)
🧪 หน้า HTML ทดสอบ
เปิดหน้า http://localhost:3000/ เพื่อกรอกพารามิเตอร์และ Fetch ข้อมูลได้ทันที

ตัวอย่างผลลัพธ์จะแสดงในรูป JSON บนหน้าเว็บ

🧾 ตัวอย่างการทดสอบด้วย curl
bash
คัดลอกโค้ด
# 1. ทดสอบค้นหา
curl "http://localhost:3000/api/foods?search=ผัด"

# 2. กรองตามหมวด
curl "http://localhost:3000/api/foods?category=dessert"

# 3. สุ่มเมนู
curl "http://localhost:3000/api/foods/random"

# 4. ดูสถิติ
curl "http://localhost:3000/api/stats"
✅ เกณฑ์การประเมิน (30%)
หัวข้อ	สถานะ
Filtering ทำงานครบทุกพารามิเตอร์	✅
Logger แสดงข้อมูล request	✅
Routes ทั้งหมดทำงานถูกต้อง (/:id, /category/:category, /random)	✅
/api/docs และ /api/stats ครบสมบูรณ์	✅
HTML demo page ใช้งานได้	✅
README อธิบายครบถ้วน	✅

🏁 สรุป
Food API นี้พร้อมสำหรับการทดสอบใน Postman / Browser / HTML page
สามารถใช้เป็นต้นแบบสำหรับการสร้าง RESTful API เบื้องต้น
ด้วย Express.js + Node.js อย่างถูกหลักและมีโครงสร้างครบถ้วน 💪
