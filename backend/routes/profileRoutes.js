const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/profile/:uid - fetch user profile
router.get('/:uid', (req, res) => {
  const { uid } = req.params;

  const query = `SELECT * FROM user_profiles WHERE uid = ?`;

  db.get(query, [uid], (err, row) => {
    if (err) {
      console.error('Error retrieving user profile:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(row);
  });
});

module.exports = router;
