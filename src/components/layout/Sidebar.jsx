import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import DMList from "../chat/DMList";
import ChannelList from "../chat/ChannelList";
import ChannelCreator from "../chat/ChannelCreator";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { setActiveUser, setActiveChannel } = useChat();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Rocket Chatter</h2>
      <div style={styles.section}>
        <h4>Channels</h4>
        <ChannelCreator />
        <ChannelList onSelectChannel={setActiveChannel} />
      </div>
      <div style={styles.section}>
        <h4>Direct Messages</h4>
        <DMList onSelectUser={setActiveUser} />
      </div>
      <div style={styles.footer}>
        <button onClick={() => navigate("/profile")} style={styles.emailButton}>
          {currentUser?.email} {currentUser?.isOnline ? "🟢" : "🔴"}
        </button>
        <br/>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "#f1f1f1",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
  },
  title: {
    marginBottom: "1rem",
  },
  section: {
    marginBottom: "2rem",
  },
  footer: {
    borderTop: "1px solid #ccc",
    paddingTop: "1rem",
  },
  emailButton: {
    background: "none",
    border: "none",
    padding: 0,
    marginBottom: "0.5rem",
    color: "#0077cc",
    textAlign: "left",
    cursor: "pointer",
    textDecoration: "underline",
  },
};