const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const FOODS_FILE = path.join(__dirname, '../data/foods.json');

// ---------- Helpers ----------
const loadFoods = () => {
    try {
        const data = fs.readFileSync(FOODS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading foods:', error);
        return [];
    }
};

const parseBool = (v) => {
    if (v === undefined) return undefined;
    const s = String(v).toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(s)) return true;
    if (['false', '0', 'no', 'n'].includes(s)) return false;
    return undefined;
};

// ---------- GET /api/foods (list + filters + sort + pagination) ----------
router.get('/', (req, res) => {
    try {
        let foods = loadFoods();

        // query params
        const {
            search,
            category,
            maxSpicy,
            vegetarian,
            available,
            minPrice,
            maxPrice,
            sort = 'name', // name | price | spicy
            order = 'asc', // asc | desc
            page = '1',
            limit = '50'
        } = req.query;

        // ---- Filtering ----
        if (search) {
            const s = String(search).toLowerCase();
            foods = foods.filter(
                (f) =>
                    (f.name || '').toLowerCase().includes(s) ||
                    (f.description || '').toLowerCase().includes(s)
            );
        }

        if (category) {
            const want = String(category).toLowerCase();
            foods = foods.filter(
                (f) => String(f.category || '').toLowerCase() === want
            );
        }

        if (maxSpicy !== undefined) {
            const mx = Number(maxSpicy);
            if (!Number.isNaN(mx)) {
                // ไม่มี spicy ให้ถือว่า 0/ไม่เผ็ด -> ผ่าน
                foods = foods.filter(
                    (f) => f.spicy === undefined || Number(f.spicy) <= mx
                );
            }
        }

        const veg = parseBool(vegetarian);
        if (veg !== undefined) {
            foods = foods.filter((f) => Boolean(f.vegetarian) === veg);
        }

        const avail = parseBool(available);
        if (avail !== undefined) {
            foods = foods.filter((f) => Boolean(f.available) === avail);
        }

        if (minPrice !== undefined) {
            const mn = Number(minPrice);
            if (!Number.isNaN(mn)) {
                foods = foods.filter((f) => Number(f.price) >= mn);
            }
        }

        if (maxPrice !== undefined) {
            const mx = Number(maxPrice);
            if (!Number.isNaN(mx)) {
                foods = foods.filter((f) => Number(f.price) <= mx);
            }
        }

        // ---- Sort ----
        const dir = order === 'desc' ? -1 : 1;
        const key = ['name', 'price', 'spicy'].includes(String(sort))
            ? String(sort)
            : 'name';

        foods.sort((a, b) => {
            const A = a[key] ?? (key === 'name' ? '' : 0);
            const B = b[key] ?? (key === 'name' ? '' : 0);

            if (typeof A === 'number' && typeof B === 'number') {
                return (A - B) * dir;
            }
            // ปรับให้เหมาะกับภาษาไทย/ไม่แคสเซนซิทีฟ
            return String(A).localeCompare(String(B), 'th', { sensitivity: 'base' }) * dir;
        });

        // ---- Pagination ----
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 50)); // cap 100
        const start = (pageNum - 1) * lim;
        const total = foods.length;
        const totalPages = Math.max(1, Math.ceil(total / lim));
        const data = foods.slice(start, start + lim);

        res.json({
            success: true,
            data,
            page: pageNum,
            limit: lim,
            total,
            totalPages,
            filters: {
                search: search ?? null,
                category: category ?? null,
                maxSpicy: maxSpicy ?? null,
                vegetarian: veg ?? null,
                available: avail ?? null,
                minPrice: minPrice ?? null,
                maxPrice: maxPrice ?? null,
                sort: key,
                order
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching foods' });
    }
});

// ---------- NOTE ----------
// จัดลำดับเส้นทางเฉพาะทาง ไว้ "เหนือ" :id เพื่อไม่ให้ชนกัน

// ---------- GET /api/foods/category/:category ----------
router.get('/category/:category', (req, res) => {
    const foods = loadFoods();
    const want = String(req.params.category).toLowerCase();
    const data = foods.filter(
        (f) => String(f.category || '').toLowerCase() === want
    );
    res.json({ success: true, data, total: data.length, category: req.params.category });
});

// ---------- GET /api/foods/random ----------
router.get('/random', (req, res) => {
    let foods = loadFoods();
    if (req.query.category) {
        const want = String(req.query.category).toLowerCase();
        foods = foods.filter(
            (f) => String(f.category || '').toLowerCase() === want
        );
    }
    if (foods.length === 0) {
        return res.status(404).json({ success: false, message: 'No foods available to random' });
    }
    const randomItem = foods[Math.floor(Math.random() * foods.length)];
    res.json({ success: true, data: randomItem });
});

// ---------- GET /api/foods/:id (digits only เพื่อกันชน) ----------
router.get('/:id(\\d+)', (req, res) => {
    const foods = loadFoods();
    const item = foods.find((f) => String(f.id) === String(req.params.id));
    if (!item) {
        return res.status(404).json({ success: false, message: 'Food not found' });
    }
    res.json({ success: true, data: item });
});

module.exports = router;
