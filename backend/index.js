require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const userRoutes = require("./routes/user");
const callRoutes = require("./routes/calls");
const chatRoutes = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount main user routes
app.use("/api/users", userRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/chat", chatRoutes);

// Inline route to update user online status
app.post("/api/users/:id/status", (req, res) => {
  const { id } = req.params;
  const { isOnline } = req.body;

  db.run(
    "UPDATE users SET isOnline = ? WHERE id = ?",
    [isOnline ? 1 : 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Status updated" });
    }
  );
});

// Inline route to get user online status
app.get("/api/users/:id/status", (req, res) => {
  const { id } = req.params;

  db.get("SELECT isOnline FROM users WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });
    res.json({ id, isOnline: row.isOnline === 1 });
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});