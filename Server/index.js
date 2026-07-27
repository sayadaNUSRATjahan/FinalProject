const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const port = 5000;
const app = express(); // <-- সবার আগে express() ডিক্লেয়ার করা হয়েছে

// middlewares
app.use(cors());
app.use(express.json());

// making connection with mysql server
let db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'myjournal',
    charset: 'utf8mb4'
});
 
db.connect(err => {
    if(err){
        console.log("Something went wrong while connecting the database:", err);
        throw err;
    }
    else {
        console.log("MySQL server is connected.");
    }
});

// getting user data from server (Login with Email)
app.post("/getuserinfo", (req, res) => {
    const { email, password } = req.body;
    console.log("Received login request for:", email);
    
    const getUserInfosql = "SELECT id, name, email FROM users WHERE email = ? AND password = ?";

    db.query(getUserInfosql, [email, password], (err, result) => {
        if(err){
            console.log("Error getting user info from server:", err);
            throw err;
        }
        else {
            res.send(result);
        }
    });
});

// Register new user
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body);
    
    const registerSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(registerSql, [name, email, password], (err, result) => {
        if(err){
            console.log("Error registering user:", err);
            throw err;
        }
        else {
            res.send(result);
        }
    });
});

// ==========================================
// 📌 JOURNAL ROUTES
// ==========================================

// ১. সব জার্নাল ফেচ করার জন্য (GET)
app.get("/getAllpost", (req, res) => {
    const sql = "SELECT * FROM journals";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// ২. নতুন জার্নাল সেভ করার জন্য (POST)
app.post("/addNewPost", (req, res) => {
    const { postedUserID, title, content, mood } = req.body;
    const sql = "INSERT INTO journals (user_id, title, content, mood, time) VALUES (?, ?, ?, ?, NOW())";
    
    db.query(sql, [postedUserID, title, content, mood], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Journal added successfully", result });
    });
});

// ৩. জার্নাল ডিলিট করার জন্য (DELETE)
app.delete("/deletePost/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM journals WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Journal deleted successfully", result });
    });
});

// ৪. জার্নাল আপডেট বা এডিট করার জন্য (PUT)
app.put("/updatePost/:id", (req, res) => {
    const id = req.params.id;
    const { title, content, mood } = req.body;
    const sql = "UPDATE journals SET title = ?, content = ?, mood = ? WHERE id = ?";
    
    db.query(sql, [title, content, mood, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Journal updated successfully", result });
    });
});

// ==========================================

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});