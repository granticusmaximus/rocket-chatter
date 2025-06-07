import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setCurrentUser(storedUser);
      axios.post(`http://localhost:5000/api/users/${storedUser.uid}/status`, { isOnline: true });
    }
    setLoading(false);

    window.onbeforeunload = () => {
      if (storedUser) {
        navigator.sendBeacon(
          `http://localhost:5000/api/users/${storedUser.uid}/status`,
          JSON.stringify({ isOnline: false })
        );
      }
    };
  }, []);

  const register = async (email, password) => {
    const newUser = { uid: crypto.randomUUID(), email };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setCurrentUser(newUser);
    await axios.post(`http://localhost:5000/api/users/${newUser.uid}/status`, { isOnline: true });
  };

  const login = async (email, password) => {
    // For now, simulate login using the saved user
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser?.email === email) {
      setCurrentUser(storedUser);
      await axios.post(`http://localhost:5000/api/users/${storedUser.uid}/status`, { isOnline: true });
    } else {
      throw new Error("Invalid login");
    }
  };

  const logout = async () => {
    if (currentUser) {
      await axios.post(`http://localhost:5000/api/users/${currentUser.uid}/status`, { isOnline: false });
    }
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}