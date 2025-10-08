// express-server.js
const express = require('express');
const app = express();
const PORT = 3001;

// ---- Mock data (เหมือน http-server.js) ----
const students = [
    { id: 1, name: 'Gun', major: 'วิศวกรรมซอฟต์แวร์', year: 3 },
    { id: 2, name: 'Beam', major: 'วิทยาการคอมพิวเตอร์', year: 2 },
    { id: 3, name: 'Cart', major: 'วิศวกรรมคอมพิวเตอร์', year: 4 },
];

// Middleware
app.use(express.json());

// (ออปชัน) CORS แบบง่ายๆ เผื่อยิงจากเว็บอื่น
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// GET /  — หน้าต้อนรับ + endpoints
app.get('/', (req, res) => {
    res.json({
        message: '👋 Welcome to Students API (Express)',
        endpoints: [
            'GET /',
            'GET /students',
            'GET /students/:id',
            'GET /students/major/:major',
            'GET /stats'
        ]
    });
});

// GET /students — คืนทั้งหมด
app.get('/students', (req, res) => {
    const { year } = req.query;
    let data = students;

    if (year !== undefined) {
        const y = Number(year);
        if (!Number.isInteger(y)) {
            return res.status(400).json({ error: 'Query "year" must be an integer' });
        }
        data = data.filter(s => s.year === y);
    }

    res.json({ count: data.length, data });
});

// GET /students/:id — หาแบบตรง id
app.get('/students/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Invalid student id' });
    }
    const stu = students.find(s => s.id === id);
    if (!stu) return res.status(404).json({ error: 'Student not found' });
    res.json(stu);
});

// GET /students/major/:major — กรองตามสาขา (ไม่สนตัวพิมพ์/เว้นวรรค)
app.get('/students/major/:major', (req, res) => {
    const q = String(req.params.major || '').toLowerCase().trim();
    const filtered = students.filter(s =>
        String(s.major).toLowerCase().includes(q)
    );
    res.json({ count: filtered.length, data: filtered });
});


// GET /stats — สถิตินักศึกษา (รวม & แยกสาขา)
app.get('/stats', (req, res) => {
    const total = students.length;
    const byMajor = students.reduce((acc, s) => {
        const key = String(s.major).trim();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    res.json({ total, byMajor });
});

// 404 handler (หลังจากไม่ตรงทุก route)
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler (กัน error ไม่คาดคิด)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Express Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /');
    console.log('  GET /students');
    console.log('  GET /students/:id');
    console.log('  GET /students/major/:major');
    console.log('  GET /stats');
});
