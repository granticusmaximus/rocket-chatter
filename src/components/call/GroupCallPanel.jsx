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
    const callDocRef = doc(db, "groupCalls", channelId);
    for (const pc of peerConnections.current.values()) {
      pc.close();
    }
    const localStream = localVideoRef.current?.srcObject;
    localStream?.getTracks().forEach((track) => track.stop());

    await updateDoc(callDocRef, {
      participants: arrayRemove(currentUser.uid),
    });

    if (onClose) onClose();
  };

  useEffect(() => {
    const localStreamPromise = navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const callDocRef = doc(db, "groupCalls", channelId);
    let unsubscribeSnapshot;

    const start = async () => {
      const localStream = await localStreamPromise;
      localVideoRef.current.srcObject = localStream;

      // Join call
      await updateDoc(callDocRef, {
        participants: arrayUnion(currentUser.uid),
      });

      unsubscribeSnapshot = onSnapshot(callDocRef, async (snap) => {
        const data = snap.data();
        const screenSharer = data?.screenSharer;
        if (screenSharer && screenSharer.uid !== currentUser.uid) {
          showToast(`${screenSharer.name} is sharing their screen`, "info");
        }
        const participants = data?.participants || [];

        for (const uid of participants) {
          if (uid === currentUser.uid || peerConnections.current.has(uid)) continue;

          // Create new peer connection
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });

          peerConnections.current.set(uid, pc);
          localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              setDoc(
                callDocRef,
                {
                  iceCandidates: {
                    [currentUser.uid]: arrayUnion(event.candidate.toJSON()),
                  },
                },
                { merge: true }
              );
            }
          };

          pc.ontrack = (event) => {
            setRemoteStreams((prev) => ({
              ...prev,
              [uid]: event.streams[0],
            }));
          };

          // Offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          await setDoc(
            callDocRef,
            {
              offers: {
                [currentUser.uid]: offer,
              },
            },
            { merge: true }
          );
        }

        // Handle answers
        const answers = data?.answers || {};
        for (const [uid, answer] of Object.entries(answers)) {
          const pc = peerConnections.current.get(uid);
          if (pc && !pc.currentRemoteDescription && uid !== currentUser.uid) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        }

        // Handle offers to us
        const offers = data?.offers || {};
        for (const [uid, offer] of Object.entries(offers)) {
          if (uid === currentUser.uid || peerConnections.current.has(uid)) continue;

          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });

          peerConnections.current.set(uid, pc);
          localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              setDoc(
                callDocRef,
                {
                  iceCandidates: {
                    [currentUser.uid]: arrayUnion(event.candidate.toJSON()),
                  },
                },
                { merge: true }
              );
            }
          };

          pc.ontrack = (event) => {
            setRemoteStreams((prev) => ({
              ...prev,
              [uid]: event.streams[0],
            }));
          };

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await setDoc(
            callDocRef,
            {
              answers: {
                [currentUser.uid]: answer,
              },
            },
            { merge: true }
          );
        }

        // Handle ICE
        const iceCandidates = data?.iceCandidates || {};
        for (const [uid, candidates] of Object.entries(iceCandidates)) {
          if (uid === currentUser.uid) continue;
          const pc = peerConnections.current.get(uid);
          if (pc) {
            for (const candidate of candidates) {
              pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }
        }
      });
    };

    start();

    return () => {
      localStreamPromise.then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

      for (const pc of peerConnections.current.values()) {
        pc.close();
      }

      updateDoc(callDocRef, {
        participants: arrayRemove(currentUser.uid),
      });

      unsubscribeSnapshot && unsubscribeSnapshot();
    };
  }, [channelId, currentUser.uid]);

  // Share Screen handler
  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      await updateDoc(doc(db, "groupCalls", channelId), {
        screenSharer: {
          uid: currentUser.uid,
          name: currentUser.displayName || "Someone",
        },
      });
      setScreenSharing(true);

      // Replace track in each peer connection
      peerConnections.current.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) videoSender.replaceTrack(screenTrack);
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
          if (videoSender) videoSender.replaceTrack(webcamTrack);
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
          srcObject={stream}
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