

export default function Toast({ message, type = "info" }) {
  return (
    <div style={{ ...styles.toast, ...styles[type] }}>
      {message}
    </div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    color: "#fff",
    zIndex: 1100,
    fontWeight: "bold",
    maxWidth: "300px",
  },
  success: {
    backgroundColor: "#28a745",
  },
  error: {
    backgroundColor: "#dc3545",
  },
  info: {
    backgroundColor: "#007bff",
  },
};