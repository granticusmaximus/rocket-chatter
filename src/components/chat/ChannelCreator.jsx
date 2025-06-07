import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

export default function ChannelCreator() {
  const [channelName, setChannelName] = useState("");
  const { currentUser } = useAuth();
  const { setActiveChannel } = useChat();

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedName = channelName.trim().toLowerCase();

    if (!trimmedName) return;

    const channelId = trimmedName.replace(/\s+/g, "-");
    const newChannel = {
      id: channelId,
      name: `# ${trimmedName}`,
      createdBy: currentUser.uid,
      isPrivate: false,
    };

    try {
      await axios.post("http://localhost:5000/api/channels", newChannel);
      setActiveChannel({ ...newChannel, createdAt: new Date().toISOString() });
      setChannelName("");
    } catch (err) {
      console.error("Error creating channel:", err);
    }
  };

  return (
    <form onSubmit={handleCreate} style={styles.form}>
      <input
        type="text"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="New channel name"
        style={styles.input}
      />
      <button type="submit" style={styles.button}>+</button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    marginBottom: "1rem",
  },
  input: {
    flex: 1,
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px 0 0 4px",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "0 4px 4px 0",
    cursor: "pointer",
  },
};