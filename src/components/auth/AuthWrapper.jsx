

import React from "react";
import { Link } from "react-router-dom";

const AuthWrapper = ({ children }) => {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>🚀 Rocket</h1>
        {children}
        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Login</Link> |{" "}
          <Link to="/register" style={styles.link}>Register</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  box: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "1rem",
  },
  links: {
    marginTop: "1rem",
  },
  link: {
    textDecoration: "none",
    color: "#007bff",
  },
};

export default AuthWrapper;