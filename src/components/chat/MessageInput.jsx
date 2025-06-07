import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import axios from "axios";

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const { currentUser } = useAuth();
  const { activeUser, activeChannel } = useChat();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || (!activeUser && !activeChannel)) return;

    const convoId = activeUser
      ? `${currentUser.uid}_${activeUser.uid}`
      : `channel_${activeChannel.id}`;

    try {
      await axios.post("http://localhost:5000/api/messages", {
        conversationId: convoId,
        senderId: currentUser.uid,
        text: message,
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <form onSubmit={handleSend} style={styles.form}>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        Send
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};