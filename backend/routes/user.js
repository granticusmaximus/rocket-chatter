const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Upload profile picture
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: filePath });
});

// Save or update user profile
router.post("/save", (req, res) => {
  const { uid, displayName, about, headerImage, profilePicture } = req.body;

  const sql = `
    INSERT INTO users (uid, displayName, about, headerImage, profilePicture)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(uid) DO UPDATE SET
      displayName = excluded.displayName,
      about = excluded.about,
      headerImage = excluded.headerImage,
      profilePicture = excluded.profilePicture;
  `;

  db.run(sql, [uid, displayName, about, headerImage, profilePicture], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get user profile
router.get("/:uid", (req, res) => {
  const { uid } = req.params;

  db.get("SELECT * FROM users WHERE uid = ?", [uid], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });
    res.json(row);
  });
});

// Get user online status
router.get("/status/:uid", (req, res) => {
  const { uid } = req.params;

  db.get("SELECT isOnline FROM users WHERE uid = ?", [uid], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });
    res.json({ uid, isOnline: row.isOnline === 1 });
  });
});

// Update user online status
router.post("/status/:uid", (req, res) => {
  const { uid } = req.params;
  const { isOnline } = req.body;

  db.run("UPDATE users SET isOnline = ? WHERE uid = ?", [isOnline ? 1 : 0, uid], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Status updated" });
  });
});

module.exports = router;