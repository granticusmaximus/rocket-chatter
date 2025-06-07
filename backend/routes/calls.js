

const express = require("express");
const router = express.Router();
const db = require("../db");

// Create a new call
router.post("/", (req, res) => {
  const { channelId, initiatorId, participants } = req.body;

  db.run(
    `INSERT INTO calls (channelId, initiatorId, participants, status, createdAt)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [channelId, initiatorId, JSON.stringify(participants), "active"],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Join a call
router.post("/:id/join", (req, res) => {
  const { userId } = req.body;
  const callId = req.params.id;

  db.get(`SELECT participants FROM calls WHERE id = ?`, [callId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Call not found" });

    let participants = JSON.parse(row.participants || "[]");
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    db.run(
      `UPDATE calls SET participants = ? WHERE id = ?`,
      [JSON.stringify(participants), callId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ message: "Joined call" });
      }
    );
  });
});

// Leave a call
router.post("/:id/leave", (req, res) => {
  const { userId } = req.body;
  const callId = req.params.id;

  db.get(`SELECT participants FROM calls WHERE id = ?`, [callId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Call not found" });

    let participants = JSON.parse(row.participants || "[]");
    participants = participants.filter((id) => id !== userId);

    const status = participants.length > 0 ? "active" : "ended";

    db.run(
      `UPDATE calls SET participants = ?, status = ? WHERE id = ?`,
      [JSON.stringify(participants), status, callId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ message: "Left call" });
      }
    );
  });
});

module.exports = router;