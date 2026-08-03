const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// আপলোড ফোল্ডার স্ট্যাটিক করা
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer কনফিগারেশন
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ডাটাবেজ কানেকশন
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myjournal'
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection error:", err);
        return;
    }
    console.log("MySQL server is connected.");
});

// ==========================================
// 📌 API Routes
// ==========================================

// ১. ইউজার লগইন রাউট
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("❌ Login Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (results.length > 0) {
            res.json({ success: true, message: "Login successful", user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Your email or password must be wrong" });
        }
    });
});

// ২. সব জার্নাল গেট করা
app.get('/getAllpost', (req, res) => {
    const sql = "SELECT * FROM journals ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Database Fetch Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: results });
    });
});

// ৩. নতুন জার্নাল অ্যাড করা (ছবি অপশনাল)
app.post('/addNewPost', upload.single('image'), (req, res) => {
    const { title, content, mood, user_id } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : null;

    const sql = "INSERT INTO journals (title, content, mood, user_id, image, time) VALUES (?, ?, ?, ?, ?, NOW())";
    db.query(sql, [title, content, mood || '😊 Happy', user_id || 1, image], (err, result) => {
        if (err) {
            console.error("❌ Database Insert Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Journal added successfully", postId: result.insertId });
    });
});

// ৪. জার্নাল আপডেট করা
app.put('/updatePost/:id', upload.single('image'), (req, res) => {
    const postId = req.params.id;
    const { title, content, mood } = req.body;
    
    if (req.file) {
        const image = `uploads/${req.file.filename}`;
        const sql = "UPDATE journals SET title = ?, content = ?, mood = ?, image = ?, updated_at = NOW() WHERE id = ?";
        db.query(sql, [title, content, mood, image, postId], (err, result) => {
            if (err) {
                console.error("❌ Database Update Error:", err.message);
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, message: "Journal updated successfully with image" });
        });
    } else {
        const sql = "UPDATE journals SET title = ?, content = ?, mood = ?, updated_at = NOW() WHERE id = ?";
        db.query(sql, [title, content, mood, postId], (err, result) => {
            if (err) {
                console.error("❌ Database Update Error:", err.message);
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, message: "Journal updated successfully" });
        });
    }
});

// ৫. জার্নাল ডিলিট করা
app.delete('/deletePost/:id', (req, res) => {
    const postId = req.params.id;
    const sql = "DELETE FROM journals WHERE id = ?";
    db.query(sql, [postId], (err, result) => {
        if (err) {
            console.error("❌ Database Delete Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Journal deleted successfully" });
    });
});

// সার্ভার রান করা
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});