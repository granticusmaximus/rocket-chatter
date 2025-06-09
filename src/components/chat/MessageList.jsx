import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import socket from "../../services/socket";
import axios from "axios";
import { getConversationId } from "../../utils/helpers";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const { currentUser } = useAuth();
  const { activeUser, activeChannel } = useChat();
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState(null);
  // const socket is imported above
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes blink {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!currentUser || (!activeUser && !activeChannel)) return;

    let convoId = null;
    if (activeUser && activeUser.uid && currentUser.uid) {
      convoId = getConversationId(currentUser.uid, activeUser.uid);
    } else if (activeChannel && activeChannel.id) {
      convoId = `channel_${activeChannel.id}`;
    } else {
      return;
    }

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${convoId}`);
        if (isMounted) {
          // Reverse messages so newest are at the bottom
          setMessages(res.data.slice().reverse());
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    // Define handler outside so we can reference same instance in cleanup
    const handleNewMessage = (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);

      if (
        newMsg.receiverId === currentUser.uid &&
        !newMsg.readBy.includes(currentUser.uid)
      ) {
        axios
          .post(`http://localhost:5000/api/messages/${newMsg.id}/read`, {
            userId: currentUser.uid,
          })
          .then(() => {
            if (socket) {
              socket.emit("messageRead", {
                messageId: newMsg.id,
                userId: currentUser.uid,
              });
            }
          })
          .catch((err) => {
            console.error("Failed to mark as read:", err);
          });
      }
    };

    if (socket && convoId) {
      socket.emit("joinConversation", convoId);
      socket.on("newMessage", handleNewMessage);

      const handleTyping = ({ userId, username }) => {
        if (userId !== currentUser.uid) {
          setTypingStatus(`${username} is typing...`);
          setTimeout(() => setTypingStatus(null), 3000);
        }
      };

      socket.on("typing", handleTyping);

      const handleMessageRead = ({ messageId, userId }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId && !msg.readBy.includes(userId)
              ? { ...msg, readBy: [...msg.readBy, userId] }
              : msg
          )
        );
      };

      socket.on("messageRead", handleMessageRead);
    }

    return () => {
      isMounted = false;
      if (socket && convoId) {
        socket.emit("leaveConversation", convoId);
        socket.off("newMessage", handleNewMessage);
        socket.off("typing", handleTyping);
        socket.off("messageRead", handleMessageRead);
      }
    };
  }, [currentUser, activeUser, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {typingStatus && (
        <div style={styles.typingIndicatorContainer}>
          <span style={styles.typingText}>{typingStatus.split(" ")[0]} is typing</span>
          <span style={styles.dot}>.</span>
          <span style={{ ...styles.dot, animationDelay: "0.2s" }}>.</span>
          <span style={{ ...styles.dot, animationDelay: "0.4s" }}>.</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    overflowY: "auto",
    maxHeight: "100%",
    padding: "1rem",
  },
  typingIndicatorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.1rem",
    paddingLeft: "1rem",
    fontStyle: "italic",
    color: "#888",
  },
  typingText: {
    marginRight: "0.25rem",
  },
  dot: {
    animationName: "blink",
    animationDuration: "1s",
    animationIterationCount: "infinite",
    fontSize: "1.25rem",
    lineHeight: "1",
  },
};