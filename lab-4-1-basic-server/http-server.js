const http = require('http');
const url = require('url');

const PORT = 3000;

// ---- Mock data ----
const students = [
    { id: 1, name: 'Gun', major: 'วิศวกรรมซอฟต์แวร์', year: 3 },
    { id: 2, name: 'Beam', major: 'วิทยาการคอมพิวเตอร์', year: 2 },
    { id: 3, name: 'Cart', major: 'วิศวกรรมคอมพิวเตอร์', year: 4 },
];

// ---- Helpers ----
function sendJSON(res, status, payload) {
    res.statusCode = status;
    res.end(JSON.stringify(payload));
}
function notFound(res, msg = 'Not Found') {
    sendJSON(res, 404, { error: msg });
}
function methodNotAllowed(res) {
    sendJSON(res, 405, { error: 'Method Not Allowed' });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname || '/';
    const method = req.method || 'GET';

    // CORS & headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }
    if (method !== 'GET') {
        return methodNotAllowed(res);
    }

    // แยก path และ decode ทีละส่วน (กันภาษาไทย/ช่องว่างที่ถูก encode)
    const rawParts = pathname.split('/').filter(Boolean);
    const parts = rawParts.map(p => {
        try { return decodeURIComponent(p); } catch { return p; }
    });

    // GET /
    if (parts.length === 0) {
        return sendJSON(res, 200, {
            message: '👋 Welcome to Students API (Node core HTTP)',
            endpoints: [
                'GET /',
                'GET /students',
                'GET /students/:id',
                'GET /students/major/:major'
            ]
        });
    }

    // Base: /students
    if (parts[0] === 'students') {
        // GET /students
        if (parts.length === 1) {
            const { year } = parsedUrl.query;
            let data = students;

            if (year !== undefined) {
                const y = Number(year);
                if (!Number.isInteger(y)) {
                    return sendJSON(res, 400, { error: 'Query "year" must be an integer' });
                }
                data = data.filter(s => s.year === y);
            }

            return sendJSON(res, 200, { count: data.length, data });
        }

        // GET /students/:id
        if (parts.length === 2) {
            const id = Number(parts[1]);
            if (!Number.isInteger(id)) {
                return notFound(res, 'Invalid student id');
            }
            const stu = students.find(s => s.id === id);
            if (!stu) return notFound(res, 'Student not found');
            return sendJSON(res, 200, stu);
        }

        // GET /students/major/:major (exact match แบบไม่สนตัวพิมพ์)
        if (parts.length === 3 && parts[1] === 'major') {
            const q = String(parts[2]).toLowerCase().trim();
            const filtered = students.filter(s =>
                String(s.major).toLowerCase().includes(q)
            );
            return sendJSON(res, 200, { count: filtered.length, data: filtered });
        }
    }

    // 404
    return notFound(res);
});

server.listen(PORT, () => {
    console.log(`🌐 HTTP Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /');
    console.log('  GET /students');
    console.log('  GET /students/:id');
    console.log('  GET /students/major/:major');
});
