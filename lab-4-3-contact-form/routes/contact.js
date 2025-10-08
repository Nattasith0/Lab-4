const express = require('express');
const router = express.Router();
const { validateContact } = require('../middleware/validation');
const { appendToJsonFile, readJsonFile } = require('../middleware/fileManager');

const CONTACTS_FILE = 'contacts.json';

// POST /api/contact
router.post('/', validateContact, async (req, res) => {
    try {
        const saved = await appendToJsonFile(CONTACTS_FILE, req.body);
        if (!saved) return res.status(500).json({ success: false, message: 'บันทึกไม่สำเร็จ' });
        res.json({ success: true, data: saved });
    } catch (e) {
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

// GET /api/contact?page=&limit=
router.get('/', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const all = await readJsonFile(CONTACTS_FILE);
        const total = all.length;
        const pages = Math.max(Math.ceil(total / limit), 1);
        const start = (page - 1) * limit;
        const items = all.slice(start, start + limit);
        res.json({ success: true, page, limit, total, pages, items });
    } catch (e) {
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;   // << สำคัญ
