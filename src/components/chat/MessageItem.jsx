export default function MessageItem({ message }) {
  const { sender, text, timestamp } = message;

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString()
    : "";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <strong>{sender}</strong>
        <span style={styles.time}>{formattedTime}</span>
      </div>
      <div style={styles.body}>{text}</div>
    </div>
  );
}

const styles = {
  container: {
    padding: "0.5rem",
    backgroundColor: "#f0f0f0",
    borderRadius: "6px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
  },
  time: {
    color: "#888",
  },
  body: {
    fontSize: "1rem",
  },
};
