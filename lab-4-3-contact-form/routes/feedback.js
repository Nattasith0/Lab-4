const express = require('express');
const router = express.Router();
const { validateFeedback } = require('../middleware/validation');
const { appendToJsonFile, readJsonFile } = require('../middleware/fileManager');

const FEEDBACK_FILE = 'feedback.json';

// POST /api/feedback
router.post('/', validateFeedback, async (req, res) => {
    try {
        const saved = await appendToJsonFile(FEEDBACK_FILE, req.body);
        if (!saved) return res.status(500).json({ success: false, message: 'บันทึกไม่สำเร็จ' });
        res.json({ success: true, data: saved });
    } catch (e) {
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

// GET /api/feedback/stats
router.get('/stats', async (req, res) => {
    try {
        const all = await readJsonFile(FEEDBACK_FILE);
        const total = all.length;
        const byRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        for (const f of all) {
            const r = Number(f.rating);
            if (r >= 1 && r <= 5) { byRating[r]++; sum += r; }
        }
        const average = total ? +(sum / total).toFixed(2) : 0;
        res.json({ success: true, total, average, byRating });
    } catch (e) {
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;   // << สำคัญ
