require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const userRoutes = require("./routes/user");
const callRoutes = require("./routes/calls");
const chatRoutes = require("./routes/chat");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
};

// Handle CORS preflight for all routes
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));
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

const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-call", ({ callId, userId }) => {
    socket.join(callId);
    socket.to(callId).emit("user-joined", { userId });
  });

  socket.on("signal", ({ callId, data }) => {
    socket.to(callId).emit("signal", data);
  });

  socket.on("leave-call", ({ callId, userId }) => {
    socket.to(callId).emit("user-left", { userId });
    socket.leave(callId);
  });

  // Chat messaging support
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`User left conversation: ${conversationId}`);
  });

  socket.on("newMessage", (message) => {
    const { conversationId } = message;
    socket.to(conversationId).emit("newMessage", message);
    console.log("Broadcasted new message to:", conversationId);
  });

  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("typing", { userId });
  });

  socket.on("stopTyping", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("stopTyping", { userId });
  });

  socket.on("message_read", ({ conversationId, messageId, userId }) => {
    console.log(`User ${userId} read message ${messageId} in conversation ${conversationId}`);
    socket.to(conversationId).emit("message_read", { messageId, userId });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});