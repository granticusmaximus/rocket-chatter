import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [activeUser, setActiveUser] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showCallPanel, setShowCallPanel] = useState(false);
  const [activeCallId, setActiveCallId] = useState(null);

  const value = {
    activeUser,
    setActiveUser,
    activeChannel,
    setActiveChannel,
    showCallPanel,
    setShowCallPanel,
    activeCallId,
    setActiveCallId,
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
