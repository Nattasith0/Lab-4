const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ===== Import routes & middleware =====
const foodRoutes = require('./routes/foods');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Helpers =====
const DATA_PATH = path.join(__dirname, 'data', 'foods.json');
function loadFoods() {
    try {
        const raw = fs.readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to read foods.json:', e.message);
        return [];
    }
}

// ===== Middlewares =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // ใช้ __dirname เพื่อกัน path เพี้ยน
app.use(logger); // custom logger

// ===== Health check =====
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ===== Routes =====
app.get('/', (req, res) => {
    res.json({
        message: '🍜 Welcome to Food API!',
        version: '1.0.0',
        endpoints: {
            foods: '/api/foods',
            search: '/api/foods?search=ผัด',
            category: '/api/foods?category=แกง',
            spicy: '/api/foods?maxSpicy=3',
            vegetarian: '/api/foods?vegetarian=true',
            documentation: '/api/docs',
            stats: '/api/stats'
        }
    });
});

// ใช้ foodRoutes สำหรับ '/api/foods'
app.use('/api/foods', foodRoutes);

// GET /api/docs – ส่งข้อมูล API documentation
app.get('/api/docs', (_req, res) => {
    res.json({
        title: 'Food API – Documentation',
        baseUrl: '/api/foods',
        methods: {
            list: {
                method: 'GET',
                path: '/api/foods',
                query: {
                    search: 'ค้นหาจากชื่อหรือคำอธิบาย (เช่น ?search=ผัด)',
                    category: 'กรองตามหมวด (เช่น ?category=แกง)',
                    vegetarian: 'true|false',
                    minPrice: 'กรองราคาขั้นต่ำ (เช่น ?minPrice=40)',
                    maxPrice: 'กรองราคาสูงสุด (เช่น ?maxPrice=80)',
                    sort: 'name|price|spicy (ค่าเริ่มต้น name)',
                    order: 'asc|desc (ค่าเริ่มต้น asc)',
                    page: 'เลขหน้า เริ่มจาก 1',
                    limit: 'จำนวนต่อหน้า (สูงสุด 100; ค่าเริ่มต้น 50)'
                }
            },
            getOne: { method: 'GET', path: '/api/foods/:id' },
            create: {
                method: 'POST',
                path: '/api/foods',
                body: { name: 'string', price: 'number', category: 'string', vegetarian: 'boolean?', description: 'string?' }
            },
            update: {
                method: 'PATCH',
                path: '/api/foods/:id',
                body: 'อัปเดตบางฟิลด์ (name, price, category, vegetarian, description)'
            },
            remove: { method: 'DELETE', path: '/api/foods/:id' }
        },
        examples: [
            '/api/foods?search=ผัด',
            '/api/foods?category=dessert&minPrice=40&maxPrice=80&sort=price&order=asc',
            '/api/foods?vegetarian=true&page=2&limit=5',
            '/api/foods?minPrice=40&maxPrice=80&sort=spicy&order=desc'
        ]
    });
});

// GET /api/stats – สถิติโดยรวมของเมนู
app.get('/api/stats', (_req, res) => {
    const foods = loadFoods();

    const total = foods.length;

    // นับหมวดหมู่
    const byCategory = foods.reduce((acc, f) => {
        const key = (f.category || 'unknown').toString();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    // นับมังสวิรัติ
    const vegetarian = foods.reduce(
        (acc, f) => {
            f.vegetarian ? acc.true++ : acc.false++;
            return acc;
        },
        { true: 0, false: 0 }
    );

    // ราคา
    const prices = foods.map((f) => Number(f.price)).filter((n) => !Number.isNaN(n));
    const price = prices.length
        ? {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2))
        }
        : { min: null, max: null, avg: null };

    // เผ็ด (ถ้ามีฟิลด์ spicy เป็นตัวเลข)
    const bySpicyLevel = foods.reduce((acc, f) => {
        if (f.spicy !== undefined && f.spicy !== null) {
            const key = String(f.spicy);
            acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
    }, {});

    res.json({
        total,
        byCategory,
        vegetarian,
        price,
        bySpicyLevel,
        lastUpdated: new Date().toISOString()
    });
});

// ===== Global Error Handler =====
// วางก่อน 404 handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// ===== 404 handler =====
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        requestedUrl: req.originalUrl
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Food API Server running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`❤️ Health: http://localhost:${PORT}/health`);
});
