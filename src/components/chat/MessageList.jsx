import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import axios from "axios";
import { getConversationId } from "../../utils/helpers";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const { currentUser } = useAuth();
  const { activeUser, activeChannel } = useChat();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    let convoId = null;
    if (activeUser) {
      convoId = getConversationId(currentUser.uid, activeUser.uid);
    } else if (activeChannel) {
      convoId = `channel_${activeChannel.id}`;
    } else {
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${convoId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [currentUser, activeUser, activeChannel]);

  return (
    <div style={styles.container}>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
};