import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileForm from "./ProfileForm";
import { getUserProfile } from "../../services/userService";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setProfileData(profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (loading) return <p>Loading profile...</p>;
  if (!profileData) return <p>No profile data found.</p>;

  return (
    <div style={styles.container}>
      <h2>Edit Your Profile</h2>
      <ProfileForm profileData={profileData} />
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
};
