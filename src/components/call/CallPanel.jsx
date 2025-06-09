import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Spinner, Button } from "reactstrap";

export default function CallPanel({ callId }) {
  const { currentUser } = useAuth();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        const { data: callData } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/calls/${callId}`);
        if (!callData) return;

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnectionRef.current = peerConnection;

        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStream.getTracks().forEach((track) =>
          peerConnection.addTrack(track, localStream)
        );
        localVideoRef.current.srcObject = localStream;
        setStream(localStream);

        peerConnection.ontrack = (event) => {
          const remoteStream = event.streams[0];
          remoteVideoRef.current.srcObject = remoteStream;
        };

        if (callData.offer) {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(callData.offer)
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/calls/${callId}/answer`, { answer });
        }

        const pollCandidates = async () => {
          try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/calls/${callId}/candidates`);
            data.forEach((item) => {
              if (item.sender !== currentUser.uid) {
                peerConnection.addIceCandidate(new RTCIceCandidate(item.candidate));
              }
            });
          } catch (error) {
            console.error("Error fetching ICE candidates", error);
          }
        };
        const intervalId = setInterval(pollCandidates, 2000);

        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/calls/${callId}/candidates`, {
              sender: currentUser.uid,
              candidate: event.candidate.toJSON(),
            });
          }
        };

        return () => clearInterval(intervalId);
      } catch (err) {
        console.error("Error initializing call:", err);
        setError("Failed to start the call.");
      }
    };

    initCall();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      peerConnectionRef.current?.close();
    };
  }, [callId, currentUser.uid]);

  const handleHangUp = () => {
    stream?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    setStream(null);
  };

  return (
    <div style={styles.container}>
      {error ? (
        <div style={styles.loading}>{error}</div>
      ) : !stream ? (
        <div style={styles.loading}>
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
          <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
          <Button color="danger" onClick={handleHangUp}>Hang Up</Button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    flexDirection: "column",
    alignItems: "center",
  },
  video: {
    width: "45%",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "300px",
  },
};