// Listen for "messageRead" events from the server
socket.on("messageRead", ({ messageId, readerId }) => {
  const event = new CustomEvent("messageRead", { detail: { messageId, readerId } });
  window.dispatchEvent(event);
});


import { io } from "socket.io-client";

// Replace with your backend server address
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

// Connection events (optional logging)
socket.on("connect", () => {
  console.log("Connected to socket server:", socket.id);
});


socket.on("disconnect", () => {
  console.log("Disconnected from socket server");
});

// Typing indicators
socket.on("userTyping", ({ conversationId, userId }) => {
  const event = new CustomEvent("userTyping", { detail: { conversationId, userId } });
  window.dispatchEvent(event);
});

socket.on("userStoppedTyping", ({ conversationId, userId }) => {
  const event = new CustomEvent("userStoppedTyping", { detail: { conversationId, userId } });
  window.dispatchEvent(event);
});

export const emitTyping = (conversationId, userId) => {
  socket.emit("typing", { conversationId, userId });
};

export const emitStopTyping = (conversationId, userId) => {
  socket.emit("stopTyping", { conversationId, userId });
};

// Emit a "readMessage" event to notify the server that a message has been read
export const emitMessageRead = (messageId, readerId) => {
  socket.emit("readMessage", { messageId, readerId });
};

export default socket;