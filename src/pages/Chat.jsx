import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";

export default function Chat() {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.chatArea}>
        <ChatWindow />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  chatArea: {
    flex: 1,
    padding: "2rem",
    backgroundColor: "#fff",
    overflowY: "auto",
  },
};