import socket from "../services/socket";
import { createContext, useContext, useState, useEffect } from "react";

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [activeUser, setActiveUser] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showCallPanel, setShowCallPanel] = useState(false);
  const [activeCallId, setActiveCallId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [readMessages, setReadMessages] = useState({});

  const markMessageAsRead = (messageId, userId) => {
    socket.emit("message_read", { messageId, userId });
  };

  useEffect(() => {
    socket.on("message_read", ({ messageId, userId }) => {
      setReadMessages((prev) => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), userId],
      }));
    });

    return () => {
      socket.off("message_read");
    };
  }, []);

  const value = {
    activeUser,
    setActiveUser,
    activeChannel,
    setActiveChannel,
    showCallPanel,
    setShowCallPanel,
    activeCallId,
    setActiveCallId,
    incomingCall,
    setIncomingCall,
    showIncomingCallModal,
    setShowIncomingCallModal,
    typingUsers,
    setTypingUsers,
    isTyping,
    setIsTyping,
    readMessages,
    setReadMessages,
    markMessageAsRead,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
