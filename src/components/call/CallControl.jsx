import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { createCall } from "../../services/callService";
import { Button } from "reactstrap";
import socket from "../../services/socket";

export default function CallControl() {
  const { currentUser } = useAuth();
  const { activeUser, setShowCallPanel, setActiveCallId } = useChat();

  const handleCall = async () => {
    if (!activeUser) return;

    const callId = `${currentUser.uid}_${activeUser.uid}`;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await createCall({
      callId,
      from: currentUser.uid,
      to: activeUser.uid,
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
      createdAt: Date.now(),
    });

    setActiveCallId(callId);
    setShowCallPanel(true);

    socket.emit("start-call", {
      callId,
      from: currentUser.uid,
      to: activeUser.uid,
    });

    console.log("Call offer created");
  };

  return (
    <Button onClick={handleCall} style={styles.button} color="primary">
      📞 Call
    </Button>
  );
}

const styles = {
  button: {
    marginBottom: "1rem",
    padding: "0.5rem 1rem",
  },
};