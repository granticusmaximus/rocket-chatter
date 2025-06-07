import { useState } from "react";

export default function ProfileCard({ profile }) {
  const {
    displayName,
    about,
    profileImageUrl,
    headerImageUrl,
    status = "offline",
  } = profile;

  const liveStatus = status;

  return (
    <div style={styles.card}>
      {headerImageUrl && (
        <div style={{ ...styles.header, backgroundImage: `url(${headerImageUrl})` }} />
      )}
      <div style={styles.avatarSection}>
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Profile" style={styles.avatar} />
        ) : (
          <div style={styles.avatarPlaceholder}>👤</div>
        )}
        <div style={styles.statusIndicator(liveStatus)} />
      </div>
      <h2 style={styles.name}>{displayName}</h2>
      <p style={styles.about}>{about}</p>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
    maxWidth: "400px",
    margin: "1rem auto",
    textAlign: "center",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    height: "120px",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  avatarSection: {
    position: "relative",
    marginTop: "-40px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid white",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid white",
    backgroundColor: "#eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
  },
  statusIndicator: (status) => ({
    position: "absolute",
    bottom: "4px",
    right: "calc(50% - 36px)",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: status === "online" ? "limegreen" : "gray",
    border: "2px solid white",
  }),
  name: {
    margin: "0.5rem 0 0.2rem",
    fontSize: "1.2rem",
  },
  about: {
    fontSize: "0.95rem",
    color: "#555",
    padding: "0 1rem 1rem",
  },
};