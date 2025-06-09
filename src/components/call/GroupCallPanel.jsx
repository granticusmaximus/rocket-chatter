import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function GroupCallPanel({ channelId, onClose }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [remoteStreams, setRemoteStreams] = useState({});
  const [screenSharing, setScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());

  const leaveCall = async () => {
    for (const pc of peerConnections.current.values()) {
      // TODO: Close peer connection
      pc.close();
    }
    const localStream = localVideoRef.current?.srcObject;
    localStream?.getTracks().forEach((track) => track.stop());

    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/calls/${channelId}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }),
    });

    if (onClose) onClose();
  };

  useEffect(() => {
    const startCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        // TODO: Initialize peer connections and add local stream to them
      } catch (err) {
        console.error("Failed to access camera/mic:", err);
        showToast("Could not access camera or microphone");
      }
    };

    startCall();

    return () => {
      localVideoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
      peerConnections.current.forEach((pc) => pc.close());
    };
  }, [channelId, currentUser.id]);

  // Share Screen handler
  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/calls/${channelId}/share-screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.displayName || "Someone",
        }),
      });
      setScreenSharing(true);

      // Replace track in each peer connection
      peerConnections.current.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          // TODO: Replace track in peer connection
          videoSender.replaceTrack(screenTrack);
        }
      });

      // Replace local preview
      if (localVideoRef.current?.srcObject) {
        const oldStream = localVideoRef.current.srcObject;
        const newStream = new MediaStream([screenTrack, ...oldStream.getAudioTracks()]);
        localVideoRef.current.srcObject = newStream;
      }

      // When screen share ends, switch back to webcam
      setScreenSharing(false);
      screenTrack.onended = async () => {
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const webcamTrack = webcamStream.getVideoTracks()[0];

        peerConnections.current.forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === "video");
          if (videoSender) {
            // TODO: Replace track in peer connection
            videoSender.replaceTrack(webcamTrack);
          }
        });

        localVideoRef.current.srcObject = webcamStream;
      };
    } catch (err) {
      console.error("Screen share failed", err);
    }
  };

  return (
    <div style={{ ...styles.grid, position: "relative" }}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 10 }}>
        <button
          onClick={handleShareScreen}
          style={{
            marginRight: "0.5rem",
            padding: "0.4rem 0.8rem",
            backgroundColor: "#17a2b8",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Share Screen
        </button>
        <button
          onClick={leaveCall}
          style={{
            padding: "0.4rem 0.8rem",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Leave Call
        </button>
      </div>
      {screenSharing && (
        <div
          style={{
            position: "absolute",
            top: "3.5rem",
            right: "1rem",
            backgroundColor: "#ffc107",
            color: "#000",
            padding: "0.3rem 0.6rem",
            borderRadius: "4px",
            fontSize: "0.9rem",
            zIndex: 10,
            boxShadow: "0 0 6px rgba(0,0,0,0.3)",
          }}
        >
          Screen Sharing Active
        </div>
      )}
      <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
      {Object.entries(remoteStreams).map(([uid, stream]) => (
        <video
          key={uid}
          ref={(el) => {
            if (el && stream) el.srcObject = stream;
          }}
          autoPlay
          playsInline
          style={styles.video}
        />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    padding: "1rem",
    justifyContent: "center",
  },
  video: {
    width: "300px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
};