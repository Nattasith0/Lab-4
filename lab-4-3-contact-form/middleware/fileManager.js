const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// สร้างโฟลเดอร์ data ถ้าไม่มี
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

// อ่านข้อมูลจากไฟล์
const readJsonFile = async (filename) => {
    try {
        await ensureDataDir();
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // ถ้าไฟล์ไม่มีหรืออ่านไม่ได้ -> สร้างไฟล์ว่างและคืน []
        try {
            const filePath = path.join(DATA_DIR, filename);
            await fs.writeFile(filePath, '[]', 'utf8');
        } catch (_) { }
        return [];
    }
};

// เขียนข้อมูลลงไฟล์
const writeJsonFile = async (filename, data) => {
    try {
        await ensureDataDir();
        const filePath = path.join(DATA_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
};

// เพิ่มข้อมูลใหม่ลงไฟล์
const appendToJsonFile = async (filename, newData) => {
    try {
        const existingData = await readJsonFile(filename);

        // เพิ่ม ID และ timestamp ให้ข้อมูลใหม่
        const dataWithId = {
            id: Date.now(),
            ...newData,
            createdAt: new Date().toISOString(),
        };

        existingData.push(dataWithId);
        await writeJsonFile(filename, existingData);
        return dataWithId;
    } catch (error) {
        console.error('Error appending to file:', error);
        return null;
    }
};

// ส่งกลับจำนวนข้อมูลในแต่ละไฟล์
const getFileStats = async (filenames = ['contacts.json', 'feedback.json']) => {
    const result = {};
    for (const name of filenames) {
        try {
            const arr = await readJsonFile(name);
            result[name] = Array.isArray(arr) ? arr.length : 0;
        } catch (e) {
            result[name] = 0;
        }
    }
    return result;
};

module.exports = {
    readJsonFile,
    writeJsonFile,
    appendToJsonFile,
    getFileStats, // << export ฟังก์ชันสถิติ
};
