import { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import CallControl from "../call/CallControl";
import GroupCallPanel from "../call/GroupCallPanel";
import { useChat } from "../../context/ChatContext";

export default function ChatWindow() {
  const { activeUser, activeChannel } = useChat();
  const [showGroupCall, setShowGroupCall] = useState(false);

  if (!activeUser && !activeChannel) {
    return (
      <div style={styles.window}>
        <div style={styles.messageList}>
          <p>Select a channel or user to start chatting</p>
        </div>
      </div>
    );
  }

  const headerTitle = activeUser
    ? `Chatting with ${activeUser.displayName}`
    : `Channel: ${activeChannel.name}`;

  return (
    <div style={styles.window}>
      <div style={styles.messageList}>
        <div style={{ marginBottom: "1rem" }}>
          <CallControl />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: "bold" }}>{headerTitle}</div>
            {activeChannel && (
              <>
                {!showGroupCall ? (
                  <button
                    onClick={() => setShowGroupCall(true)}
                    style={{
                      marginLeft: "1rem",
                      padding: "0.4rem 0.8rem",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Start Group Call
                  </button>
                ) : (
                  <button
                    onClick={() => setShowGroupCall(false)}
                    style={{
                      marginLeft: "1rem",
                      padding: "0.4rem 0.8rem",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    End Group Call
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <MessageList />
        {showGroupCall && (
          <GroupCallPanel
            channelId={activeChannel.id}
            onClose={() => setShowGroupCall(false)}
          />
        )}
      </div>
      <div style={styles.messageInput}>
        <MessageInput />
      </div>
    </div>
  );
}

const styles = {
  window: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#fff",
    borderLeft: "1px solid #ccc",
  },
  messageList: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
  },
  messageInput: {
    borderTop: "1px solid #ccc",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
  },
};