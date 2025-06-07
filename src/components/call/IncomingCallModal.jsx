import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

export default function IncomingCallModal() {
  const { currentUser } = useAuth();
  const { setActiveUser, setShowCallPanel, setActiveCallId } = useChat();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/calls/incoming/${currentUser.uid}`);
        if (res.data && res.data.length > 0 && !incomingCall) {
          setIncomingCall(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching incoming calls:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser.uid, incomingCall]);

  const handleAccept = async () => {
    try {
      setActiveUser({ uid: incomingCall.from });
      setActiveCallId(incomingCall.id);
      setShowCallPanel(true);
      await axios.delete(`http://localhost:5000/api/calls/${incomingCall.id}`);
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
    }
  };

  const handleReject = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/calls/${incomingCall.id}`);
      setIncomingCall(null);
    } catch (err) {
      console.error("Error rejecting call:", err);
    }
  };

  if (!incomingCall) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3>Incoming Call</h3>
        <p>{incomingCall.from} is calling you...</p>
        <div style={styles.actions}>
          <button onClick={handleAccept} style={styles.accept}>Accept</button>
          <button onClick={handleReject} style={styles.reject}>Reject</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    textAlign: "center",
  },
  actions: {
    marginTop: "1rem",
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
  },
  accept: {
    padding: "0.5rem 1rem",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  reject: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};