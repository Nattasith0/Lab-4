// Global variables
let isSubmitting = false;

// DOM Elements
const contactForm = document.getElementById('contactForm');
const feedbackForm = document.getElementById('feedbackForm');
const statusMessages = document.getElementById('statusMessages');
const apiResults = document.getElementById('apiResults');
const ratingSlider = document.getElementById('rating');
const ratingValue = document.getElementById('ratingValue');

// ===== Helpers =====
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{9,10}$/;

function getErrorEl(fieldId) {
    // มี error div เฉพาะบางฟิลด์เท่านั้น
    const map = {
        name: 'nameError',
        email: 'emailError',
        phone: 'phoneError',
        subject: 'subjectError',
        message: 'messageError',
        comment: 'commentError',
        // feedbackEmail ไม่มี error div ใน HTML
    };
    const id = map[fieldId];
    return id ? document.getElementById(id) : null;
}

function setFieldState(inputEl, isValid, message = '', fieldIdForError = null) {
    if (!inputEl) return;
    // toggle border color (ตาม CSS)
    if (inputEl.tagName !== 'TEXTAREA') {
        inputEl.classList.toggle('valid', isValid);
        inputEl.classList.toggle('invalid', !isValid);
    } else {
        // สำหรับ textarea ก็ใช้คลาสเหมือนกัน
        inputEl.classList.toggle('valid', isValid);
        inputEl.classList.toggle('invalid', !isValid);
    }

    // inline error (ถ้ามี element)
    const errorEl = getErrorEl(fieldIdForError || inputEl.id);
    if (errorEl) errorEl.textContent = isValid ? '' : message;
}

// ===== Client-side validation core =====
function validateField(fieldName, rawValue) {
    const v = (rawValue ?? '').toString().trim();

    switch (fieldName) {
        case 'name':
            if (v.length < 2) return { isValid: false, message: 'อย่างน้อย 2 ตัวอักษร' };
            if (v.length > 100) return { isValid: false, message: 'ไม่เกิน 100 ตัวอักษร' };
            return { isValid: true, message: '' };

        case 'email':
            if (v.length === 0) return { isValid: false, message: 'จำเป็น' };
            if (!emailRegex.test(v)) return { isValid: false, message: 'อีเมลไม่ถูกต้อง' };
            return { isValid: true, message: '' };

        case 'phone': // optional
            if (v.length === 0) return { isValid: true, message: '' };
            if (!phoneRegex.test(v)) return { isValid: false, message: 'ตัวเลข 9–10 หลัก' };
            return { isValid: true, message: '' };

        case 'company': // optional
            if (v.length > 100) return { isValid: false, message: 'ไม่เกิน 100 ตัวอักษร' };
            return { isValid: true, message: '' };

        case 'subject':
            if (v.length < 5) return { isValid: false, message: 'อย่างน้อย 5 ตัวอักษร' };
            if (v.length > 200) return { isValid: false, message: 'ไม่เกิน 200 ตัวอักษร' };
            return { isValid: true, message: '' };

        case 'message':
            if (v.length < 10) return { isValid: false, message: 'อย่างน้อย 10 ตัวอักษร' };
            if (v.length > 1000) return { isValid: false, message: 'ไม่เกิน 1000 ตัวอักษร' };
            return { isValid: true, message: '' };

        case 'rating':
            const r = Number(v);
            if (!Number.isInteger(r) || r < 1 || r > 5) return { isValid: false, message: 'ต้องเป็นคะแนน 1–5' };
            return { isValid: true, message: '' };

        case 'comment':
            if (v.length < 5) return { isValid: false, message: 'อย่างน้อย 5 ตัวอักษร' };
            if (v.length > 500) return { isValid: false, message: 'ไม่เกิน 500 ตัวอักษร' };
            return { isValid: true, message: '' };

        case 'feedbackEmail': // optional
            if (v.length === 0) return { isValid: true, message: '' };
            if (!emailRegex.test(v)) return { isValid: false, message: 'อีเมลไม่ถูกต้อง' };
            return { isValid: true, message: '' };

        default:
            return { isValid: true, message: '' };
    }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    initializeForms();
    setupEventListeners();
});

function initializeForms() {
    // Update rating display
    ratingSlider.addEventListener('input', () => {
        ratingValue.textContent = ratingSlider.value;
    });
}

function setupEventListeners() {
    // Contact form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitContactForm();
    });

    // Feedback form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitFeedbackForm();
    });

    // Real-time validation — ผูก event ให้ทุกช่องที่จำเป็น
    const bindings = [
        // contact form
        { id: 'name', type: 'name' },
        { id: 'email', type: 'email' },
        { id: 'phone', type: 'phone' },
        { id: 'company', type: 'company' },
        { id: 'subject', type: 'subject' },
        { id: 'message', type: 'message' },
        // feedback form
        { id: 'rating', type: 'rating' },
        { id: 'comment', type: 'comment' },
        { id: 'feedbackEmail', type: 'feedbackEmail' }
    ];

    bindings.forEach(({ id, type }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            const { isValid, message } = validateField(type, el.value);
            // feedbackEmail ไม่มี error div, จะแสดงแค่ border และ statusMessages ถ้าอยากได้
            setFieldState(el, isValid, message, id);
        });
    });
}

// ===== Submit Handlers =====
async function submitContactForm() {
    if (isSubmitting) return;

    // Validate client-side ก่อนส่ง (กันพลาดพื้นฐาน)
    const fieldsToCheck = [
        { id: 'name', type: 'name' },
        { id: 'email', type: 'email' },
        { id: 'subject', type: 'subject' },
        { id: 'message', type: 'message' },
        { id: 'phone', type: 'phone' },       // optional
        { id: 'company', type: 'company' }    // optional
    ];
    let clientErrors = 0;
    fieldsToCheck.forEach(({ id, type }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const { isValid, message } = validateField(type, el.value);
        setFieldState(el, isValid, message, id);
        if (!isValid) clientErrors++;
    });
    if (clientErrors > 0) {
        showStatusMessage('❌ กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง', 'error');
        return;
    }

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
        isSubmitting = true;
        updateSubmitButton('contactSubmit', 'กำลังส่ง...', true);

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatusMessage('✅ ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็ว', 'success');
            contactForm.reset();
            // รีเซ็ต state validation
            fieldsToCheck.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.remove('valid', 'invalid');
                    const errEl = getErrorEl(id);
                    if (errEl) errEl.textContent = '';
                }
            });
        } else {
            showStatusMessage(`❌ เกิดข้อผิดพลาด: ${result.message}`, 'error');
            if (result.errors) displayValidationErrors(result.errors);
        }
    } catch (error) {
        showStatusMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        console.error('Error:', error);
    } finally {
        isSubmitting = false;
        updateSubmitButton('contactSubmit', 'ส่งข้อความ', false);
    }
}

async function submitFeedbackForm() {
    if (isSubmitting) return;

    // Client-side validate feedback
    const fieldsToCheck = [
        { id: 'rating', type: 'rating' },
        { id: 'comment', type: 'comment' },
        { id: 'feedbackEmail', type: 'feedbackEmail' } // optional
    ];
    let clientErrors = 0;
    fieldsToCheck.forEach(({ id, type }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const { isValid, message } = validateField(type, el.value);
        setFieldState(el, isValid, message, id);
        if (!isValid && id !== 'feedbackEmail') clientErrors++; // feedbackEmail optional
    });
    if (clientErrors > 0) {
        showStatusMessage('❌ กรุณาตรวจสอบข้อมูลความคิดเห็นอีกครั้ง', 'error');
        return;
    }

    const formData = new FormData(feedbackForm);
    const data = Object.fromEntries(formData.entries());
    data.rating = parseInt(data.rating, 10);

    try {
        isSubmitting = true;
        updateSubmitButton('feedbackSubmit', 'กำลังส่ง...', true);

        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatusMessage('✅ ขอบคุณสำหรับความคิดเห็น!', 'success');
            feedbackForm.reset();
            // reset slider display
            ratingSlider.value = 3;
            ratingValue.textContent = '3';
            // รีเซ็ต border/error
            fieldsToCheck.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('valid', 'invalid');
                const errEl = getErrorEl(id);
                if (errEl) errEl.textContent = '';
            });
        } else {
            showStatusMessage(`❌ เกิดข้อผิดพลาด: ${result.message}`, 'error');
            if (result.errors) displayValidationErrors(result.errors);
        }
    } catch (error) {
        showStatusMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        console.error('Error:', error);
    } finally {
        isSubmitting = false;
        updateSubmitButton('feedbackSubmit', 'ส่งความคิดเห็น', false);
    }
}

// ===== UI helpers =====
function showStatusMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;

    statusMessages.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function updateSubmitButton(buttonId, text, disabled) {
    const button = document.getElementById(buttonId);
    button.textContent = text;
    button.disabled = disabled;
}

function displayValidationErrors(errors) {
    errors.forEach(error => {
        showStatusMessage(`🔸 ${error}`, 'error');
    });
}

// ===== API Testing Functions =====
async function loadContacts() {
    try {
        apiResults.textContent = 'Loading contacts...';
        const res = await fetch('/api/contact?page=1&limit=10');
        const data = await res.json();
        apiResults.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        apiResults.textContent = 'Error loading contacts: ' + error.message;
    }
}

async function loadFeedbackStats() {
    try {
        apiResults.textContent = 'Loading feedback stats...';
        const res = await fetch('/api/feedback/stats');
        const data = await res.json();
        apiResults.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        apiResults.textContent = 'Error loading feedback stats: ' + error.message;
    }
}

async function loadAPIStatus() {
    try {
        apiResults.textContent = 'Loading API status...';
        const res = await fetch('/api/status');
        const data = await res.json();
        apiResults.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        apiResults.textContent = 'Error loading API status: ' + error.message;
    }
}

async function loadAPIDocs() {
    try {
        const response = await fetch('/api/docs');
        const data = await response.json();
        apiResults.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        apiResults.textContent = 'Error loading API docs: ' + error.message;
    }
}
