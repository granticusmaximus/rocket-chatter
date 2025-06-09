const express = require("express");
const router = express.Router();
const db = require("../db");

// Notify that a user started screen sharing
router.post("/:id/share-screen", (req, res) => {
  const callId = req.params.id;
  const { userId } = req.body;

  db.get("SELECT screenSharers FROM calls WHERE id = ?", [callId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Call not found" });

    let screenSharers = [];
    if (row.screenSharers) {
      try {
        screenSharers = JSON.parse(row.screenSharers);
      } catch (e) {
        return res.status(500).json({ error: "Invalid screenSharers format" });
      }
    }

    if (!screenSharers.includes(userId)) {
      screenSharers.push(userId);
    }

    db.run(
      `UPDATE calls SET screenSharers = ? WHERE id = ?`,
      [JSON.stringify(screenSharers), callId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ message: "Screen sharing updated" });
      }
    );
  });
});

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

// Get a call by ID
router.get("/:id", (req, res) => {
  const callId = req.params.id;

  db.get("SELECT * FROM calls WHERE id = ?", [callId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Call not found" });
    res.json(row);
  });
});

// Save answer SDP
router.post("/:id/answer", (req, res) => {
  const callId = req.params.id;
  const { answer } = req.body;

  db.run(
    `UPDATE calls SET answer = ? WHERE id = ?`,
    [JSON.stringify(answer), callId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Answer saved" });
    }
  );
});

// Add ICE candidate
router.post("/:id/candidates", (req, res) => {
  const callId = req.params.id;
  const { candidate } = req.body;

  db.get("SELECT candidates FROM calls WHERE id = ?", [callId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Call not found" });

    let candidates = [];
    if (row.candidates) {
      try {
        candidates = JSON.parse(row.candidates);
      } catch (e) {
        return res.status(500).json({ error: "Invalid candidates format" });
      }
    }

    candidates.push(candidate);

    db.run(
      `UPDATE calls SET candidates = ? WHERE id = ?`,
      [JSON.stringify(candidates), callId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ message: "Candidate added" });
      }
    );
  });
});

// Get ICE candidates
router.get("/:id/candidates", (req, res) => {
  const callId = req.params.id;

  db.get("SELECT candidates FROM calls WHERE id = ?", [callId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Call not found" });

    let candidates = [];
    if (row.candidates) {
      try {
        candidates = JSON.parse(row.candidates);
      } catch (e) {
        return res.status(500).json({ error: "Invalid candidates format" });
      }
    }

    res.json({ candidates });
  });
});

module.exports = router;