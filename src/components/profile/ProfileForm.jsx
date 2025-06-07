import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { saveUserProfile, uploadImage } from "../../services/userService";

export default function ProfileForm({ profileData = {} }) {
  const [displayName, setDisplayName] = useState(profileData?.displayName || "");
  const [about, setAbout] = useState(profileData?.about || "");
  const [profileImage, setProfileImage] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      let profileImageUrl = profileData?.profileImageUrl || "";
      let headerImageUrl = profileData?.headerImageUrl || "";

      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage);
      }
      if (headerImage) {
        headerImageUrl = await uploadImage(headerImage);
      }

      await saveUserProfile(currentUser.uid, {
        displayName,
        about,
        profileImageUrl,
        headerImageUrl,
      });

      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div>
        <label>Preferred Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={styles.input}
        />
      </div>

      <div>
        <label>About Me</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div>
        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
        {(profileImage || profileData?.profileImageUrl) && (
          <img
            src={profileImage ? URL.createObjectURL(profileImage) : profileData?.profileImageUrl || ""}
            alt="Profile Preview"
            style={styles.imagePreview}
          />
        )}
      </div>

      <div>
        <label>Header Image</label>
        <input type="file" accept="image/*" onChange={(e) => setHeaderImage(e.target.files[0])} />
        {(headerImage || profileData?.headerImageUrl) && (
          <img
            src={headerImage ? URL.createObjectURL(headerImage) : profileData?.headerImageUrl || ""}
            alt="Header Preview"
            style={styles.imagePreview}
          />
        )}
      </div>

      <button type="submit" style={styles.button}>Save Profile</button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    width: "100%",
  },
  textarea: {
    padding: "0.5rem",
    fontSize: "1rem",
    width: "100%",
    minHeight: "100px",
  },
  button: {
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  imagePreview: {
    marginTop: "0.5rem",
    maxWidth: "100%",
    height: "auto",
    borderRadius: "6px",
  },
};