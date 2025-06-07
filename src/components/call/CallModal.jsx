import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import CallPanel from "./CallPanel";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "reactstrap";

export default function CallModal() {
  const { showCallPanel, activeCallId, setShowCallPanel } = useChat();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const handleEndCall = async () => {
    if (activeCallId) {
      try {
        await axios.delete(`http://localhost:5000/api/calls/${activeCallId}`);
        showToast("Call ended", "info");
      } catch (error) {
        console.error("Error ending call:", error);
        showToast("Failed to end call", "error");
      }
    }
    setShowCallPanel(false);
  };

  if (!showCallPanel || !activeCallId) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.panel}>
        <CallPanel callId={activeCallId} />
        <Button color="danger" onClick={handleEndCall}>
          End Call
        </Button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    backgroundColor: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    position: "relative",
  },
};
