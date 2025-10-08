// server.js (ฉบับแก้ไขพร้อมใช้งาน)
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// import routes
const contactRoutes = require('./routes/contact');
const feedbackRoutes = require('./routes/feedback');

// import helper สำหรับนับจำนวนข้อมูล
const { getFileStats } = require('./middleware/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// ถ้าอยู่หลัง proxy (เช่น Render/Heroku/Nginx) ให้เปิดบรรทัดนี้เพื่อให้ rate-limit นับ IP ได้ถูก
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 10, // จำกัด 10 ครั้ง/หน้าต่างเวลา
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting เฉพาะ /api
app.use('/api', limiter);

// Routes หน้าเว็บ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ใช้ contactRoutes และ feedbackRoutes
app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);

// API documentation
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'Contact Form API Documentation',
        version: '1.0.0',
        endpoints: {
            'POST /api/contact': {
                description: 'Submit contact form',
                requiredFields: ['name', 'email', 'subject', 'message'],
                optionalFields: ['phone', 'company'],
            },
            'GET /api/contact': {
                description: 'Get all contact submissions (admin)',
                parameters: {
                    page: 'Page number (default: 1)',
                    limit: 'Items per page (default: 10)',
                },
            },
            'POST /api/feedback': {
                description: 'Submit feedback',
                requiredFields: ['rating', 'comment'],
                optionalFields: ['email'],
            },
            'GET /api/feedback/stats': {
                description: 'Get feedback statistics',
            },
            'GET /api/status': {
                description: 'API health & stored items count',
            },
        },
    });
});

// GET /api/status — สถานะ API + จำนวนข้อมูลในไฟล์
app.get('/api/status', async (req, res) => {
    try {
        const counts = await getFileStats(['contacts.json', 'feedback.json']);
        res.json({
            success: true,
            service: 'Contact Form API',
            version: '1.0.0',
            uptimeSec: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
            counts, // { contacts.json: N, feedback.json: M }
            docs: '/api/docs',
            rateLimit: { windowMs: 15 * 60 * 1000, max: 10 },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Unable to read stats',
            error: String(err?.message || err),
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Contact Form API running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
});
