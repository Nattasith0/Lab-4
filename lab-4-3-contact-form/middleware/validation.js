// middleware/validation.js

// ========== Helpers ==========
const isString = (v) => typeof v === 'string' || v instanceof String;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{9,10}$/;

const pushErr = (errors, field, msg) => {
    errors.push(`${field}: ${msg}`);
};

// Contact form validation
const validateContact = (req, res, next) => {
    // ป้องกันกรณี body ว่าง
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: ['request: invalid body'],
        });
    }

    let { name, email, subject, message, phone, company } = req.body;
    const errors = [];

    // บังคับเป็น string ก่อนตรวจ (กันกรณีเป็น number/null)
    if (name != null && !isString(name)) name = String(name);
    if (email != null && !isString(email)) email = String(email);
    if (subject != null && !isString(subject)) subject = String(subject);
    if (message != null && !isString(message)) message = String(message);
    if (phone != null && !isString(phone)) phone = String(phone);
    if (company != null && !isString(company)) company = String(company);

    // ===== name =====
    if (name == null || name === '') {
        pushErr(errors, 'name', 'ต้องมีค่า');
    } else {
        const t = name.trim();
        if (t.length < 2) pushErr(errors, 'name', 'ความยาวอย่างน้อย 2 ตัวอักษร');
        if (t.length > 100) pushErr(errors, 'name', 'ต้องไม่เกิน 100 ตัวอักษร');
    }

    // ===== email =====
    if (email == null || email === '') {
        pushErr(errors, 'email', 'ต้องมีค่า');
    } else {
        const t = email.trim();
        if (!emailRegex.test(t)) pushErr(errors, 'email', 'รูปแบบอีเมลไม่ถูกต้อง');
    }

    // ===== subject =====
    if (subject == null || subject === '') {
        pushErr(errors, 'subject', 'ต้องมีค่า');
    } else {
        const t = subject.trim();
        if (t.length < 5) pushErr(errors, 'subject', 'ความยาวอย่างน้อย 5 ตัวอักษร');
        if (t.length > 200) pushErr(errors, 'subject', 'ต้องไม่เกิน 200 ตัวอักษร');
    }

    // ===== message =====
    if (message == null || message === '') {
        pushErr(errors, 'message', 'ต้องมีค่า');
    } else {
        const t = message.trim();
        if (t.length < 10) pushErr(errors, 'message', 'ความยาวอย่างน้อย 10 ตัวอักษร');
        if (t.length > 1000) pushErr(errors, 'message', 'ต้องไม่เกิน 1000 ตัวอักษร');
    }

    // ===== phone (optional) =====
    if (phone != null && phone !== '') {
        const t = phone.trim();
        if (!phoneRegex.test(t)) {
            pushErr(errors, 'phone', 'ต้องเป็นตัวเลข 9-10 หลัก');
        }
    }

    // ===== company (optional) =====
    if (company != null && company !== '') {
        const t = company.trim();
        if (t.length > 100) pushErr(errors, 'company', 'ต้องไม่เกิน 100 ตัวอักษร');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    // Sanitize data (เฉพาะฟิลด์ที่จำเป็น)
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.subject = subject.trim();
    req.body.message = message.trim();
    if (phone != null) req.body.phone = phone.trim();
    if (company != null) req.body.company = company.trim();

    next();
};

// Feedback validation
const validateFeedback = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: ['request: invalid body'],
        });
    }

    let { rating, comment, email } = req.body;
    const errors = [];

    // แปลง rating เป็นตัวเลขก่อน
    if (rating !== undefined && rating !== null && rating !== '') {
        rating = Number(rating);
    }

    // ===== rating =====
    if (rating == null || Number.isNaN(rating)) {
        pushErr(errors, 'rating', 'ต้องมีค่าและเป็นตัวเลข');
    } else {
        if (!Number.isInteger(rating)) pushErr(errors, 'rating', 'ต้องเป็นจำนวนเต็ม 1-5');
        if (rating < 1 || rating > 5) pushErr(errors, 'rating', 'ต้องอยู่ในช่วง 1-5');
    }

    // ===== comment =====
    if (comment == null || comment === '') {
        pushErr(errors, 'comment', 'ต้องมีค่า');
    } else {
        if (!isString(comment)) comment = String(comment);
        const t = comment.trim();
        if (t.length < 5) pushErr(errors, 'comment', 'ความยาวอย่างน้อย 5 ตัวอักษร');
        if (t.length > 500) pushErr(errors, 'comment', 'ต้องไม่เกิน 500 ตัวอักษร');
        req.body.comment = t; // sanitize
    }

    // ===== email (optional) =====
    if (email != null && email !== '') {
        if (!isString(email)) email = String(email);
        const t = email.trim();
        if (!emailRegex.test(t)) pushErr(errors, 'email', 'รูปแบบอีเมลไม่ถูกต้อง');
        req.body.email = t.toLowerCase(); // sanitize
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    // เก็บ rating หลังจากตรวจผ่าน
    req.body.rating = Number(rating);

    next();
};

module.exports = {
    validateContact,
    validateFeedback,
};
