import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import axios from "axios";
import { Input, Button, Form, FormGroup } from "reactstrap";
import socket from "../../services/socket";

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const { currentUser } = useAuth();
  const { activeUser, activeChannel } = useChat();

  const convoId = activeUser
    ? [currentUser.uid, activeUser.uid].sort().join("_")
    : `channel_${activeChannel.id}`;

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || (!activeUser && !activeChannel)) return;

    const payload = {
      conversationId: convoId,
      senderId: currentUser.uid,
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post("http://localhost:5000/api/messages", payload);
      socket.emit("newMessage", payload);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <Form onSubmit={handleSend} className="d-flex gap-2">
      <FormGroup className="flex-grow-1 mb-0">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            const text = e.target.value;
            setMessage(text);

            if (!isTypingRef.current) {
              isTypingRef.current = true;
              socket.emit("typing", {
                conversationId: convoId,
                senderId: currentUser.uid,
                isTyping: true,
              });
            }

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              isTypingRef.current = false;
              socket.emit("typing", {
                conversationId: convoId,
                senderId: currentUser.uid,
                isTyping: false,
              });
            }, 1500);
          }}
        />
      </FormGroup>
      <Button type="submit" color="primary">
        Send
      </Button>
    </Form>
  );
}