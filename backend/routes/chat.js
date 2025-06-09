const express = require("express");
const db = require("../db");

const router = express.Router();

// Get all conversations for a user
router.get("/conversations/:userId", (req, res) => {
  const { userId } = req.params;
  db.all(
    `SELECT c.* FROM conversations c
     JOIN participants p ON c.id = p.conversationId
     WHERE p.userId = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create a new conversation
router.post("/conversations", (req, res) => {
  const { name } = req.body;
  db.run(
    "INSERT INTO conversations (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name });
    }
  );
});

// Add participant to conversation
router.post("/participants", (req, res) => {
  const { conversationId, userId } = req.body;
  db.run(
    "INSERT INTO participants (conversationId, userId) VALUES (?, ?)",
    [conversationId, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, conversationId, userId });
    }
  );
});

// Get messages for a conversation
router.get("/messages/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  db.all(
    "SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC",
    [conversationId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Send a message
router.post("/messages", (req, res) => {
  const { conversationId, senderId, content } = req.body;
  const timestamp = new Date().toISOString();
  db.run(
    "INSERT INTO messages (conversationId, senderId, content, timestamp) VALUES (?, ?, ?, ?)",
    [conversationId, senderId, content, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, conversationId, senderId, content, timestamp });
    }
  );
});


// Mark a message as read by a user
router.post("/messages/:id/read", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  db.get("SELECT readBy FROM messages WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Message not found" });

    let readBy = [];
    try {
      readBy = JSON.parse(row.readBy || "[]");
    } catch {
      readBy = [];
    }

    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }

    db.run(
      "UPDATE messages SET readBy = ? WHERE id = ?",
      [JSON.stringify(readBy), id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Message marked as read", readBy });
      }
    );
  });
});

module.exports = router;