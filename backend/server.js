// ================== IMPORTS ==================
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const db = require("./db"); // Make sure db.js uses process.env for Railway

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ================== FILE UPLOAD CONFIG ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") cb(null, "public/uploads/images/");
    else cb(null, "public/uploads/animations/");
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Serve uploads and frontend
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

// ================== ROUTES ==================

// ------ HOME ------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/home.html"));
});

// ------ REGISTER ------
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const checkUserSql = "SELECT * FROM user WHERE email = ?";
  db.query(checkUserSql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (results.length > 0) return res.status(409).json({ success: false, message: "Already registered" });

    const insertSql = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
    db.query(insertSql, [name, email, password], (err) => {
      if (err) return res.status(400).json({ success: false, message: "Registration failed" });
      res.status(200).json({ success: true, message: "✅ Registered successfully" });
    });
  });
});

// ------ LOGIN ------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check admin first
  const adminSql = "SELECT * FROM admin WHERE email = ? AND password = ?";
  db.query(adminSql, [email, password], (err, adminResults) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (adminResults.length > 0) {
      return res.status(200).json({
        success: true,
        email: adminResults[0].email,
        userId: adminResults[0].id,
        isAdmin: true,
      });
    }

    // Otherwise check normal user
    const userSql = "SELECT * FROM user WHERE email = ? AND password = ?";
    db.query(userSql, [email, password], (err, userResults) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });

      if (userResults.length > 0) {
        return res.status(200).json({
          success: true,
          email: userResults[0].email,
          userId: userResults[0].id,
          isAdmin: false,
        });
      } else {
        return res.status(404).json({ success: false, message: "You are not registered" });
      }
    });
  });
});

// ------ FETCH ALGORITHMS ------
app.get("/api/algorithms", (req, res) => {
  const sql = "SELECT * FROM Algorithm";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.status(200).json({ success: true, algorithms: results });
  });
});

app.get("/api/algorithm", (req, res) => {
  const algoName = req.query.name;
  const sql = "SELECT * FROM Algorithm WHERE name = ?";
  db.query(sql, [algoName], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (results.length === 0) return res.status(404).json({ success: false, message: "Algorithm not found" });

    res.status(200).json({ success: true, ...results[0] });
  });
});

// ------ FEEDBACK ------
app.post("/api/feedback", (req, res) => {
  const { userId, algorithmId, feedbackText } = req.body;
  const sql = "INSERT INTO Feedback (user_id, algorithm_id, feedback) VALUES (?, ?, ?)";
  db.query(sql, [userId, algorithmId, feedbackText], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error saving feedback" });
    res.status(200).json({ success: true, message: "Feedback submitted successfully!" });
  });
});

// ------ ADMIN ROUTES ------

// Users
app.get("/api/users", (req, res) => {
  db.query("SELECT id, name, email FROM user", (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, users: results });
  });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM user WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "DB Delete Error" });
    res.json({ success: true, message: "User deleted successfully!" });
  });
});

// Feedbacks
app.get("/api/feedbacks", (req, res) => {
  const sql = `
    SELECT f.id, u.name AS user_name, a.name AS algo_name, f.feedback
    FROM Feedback f
    JOIN user u ON f.user_id = u.id
    JOIN Algorithm a ON f.algorithm_id = a.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, feedbacks: results });
  });
});

app.delete("/api/feedbacks/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Feedback WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "DB Delete Error" });
    res.json({ success: true, message: "Feedback deleted successfully!" });
  });
});

// Algorithms (Add / Update / Delete)
app.post(
  "/api/algorithm",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "visual_html", maxCount: 1 },
    { name: "visual_css", maxCount: 1 },
    { name: "visual_js", maxCount: 1 },
  ]),
  (req, res) => {
    const { name, code, explanation } = req.body;
    const created_by = 1; // Admin ID placeholder

    const image_url = req.files["image"] ? `/uploads/images/${req.files["image"][0].filename}` : "";
    const visual_html = req.files["visual_html"] ? `/uploads/animations/${req.files["visual_html"][0].filename}` : "";
    const visual_css = req.files["visual_css"] ? `/uploads/animations/${req.files["visual_css"][0].filename}` : "";
    const visual_js = req.files["visual_js"] ? `/uploads/animations/${req.files["visual_js"][0].filename}` : "";

    const sql =
      "INSERT INTO Algorithm (name, code, image_url, explanation, visual_html, visual_css, visual_js, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, code, image_url, explanation, visual_html, visual_css, visual_js, created_by], (err) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ success: false, message: "DB Insert Error" });
      }
      res.json({ success: true, message: "✅ Algorithm added successfully!" });
    });
  }
);

app.put(
  "/api/algorithm/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "visual_html", maxCount: 1 },
    { name: "visual_css", maxCount: 1 },
    { name: "visual_js", maxCount: 1 },
  ]),
  (req, res) => {
    const { id } = req.params;
    const { name, code, explanation } = req.body;

    const image_url = req.files["image"]
      ? `/uploads/images/${req.files["image"][0].filename}`
      : req.body.old_image_url;
    const visual_html = req.files["visual_html"]
      ? `/uploads/animations/${req.files["visual_html"][0].filename}`
      : req.body.old_visual_html;
    const visual_css = req.files["visual_css"]
      ? `/uploads/animations/${req.files["visual_css"][0].filename}`
      : req.body.old_visual_css;
    const visual_js = req.files["visual_js"]
      ? `/uploads/animations/${req.files["visual_js"][0].filename}`
      : req.body.old_visual_js;

    const sql =
      "UPDATE Algorithm SET name=?, code=?, image_url=?, explanation=?, visual_html=?, visual_css=?, visual_js=? WHERE id=?";
    db.query(sql, [name, code, image_url, explanation, visual_html, visual_css, visual_js, id], (err) => {
      if (err) return res.status(500).json({ success: false, message: "DB Update Error" });
      res.json({ success: true, message: "Algorithm updated successfully!" });
    });
  }
);

app.delete("/api/algorithm/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Algorithm WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "DB Delete Error" });
    res.json({ success: true, message: "Algorithm deleted successfully!" });
  });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));