

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import ProfileCard from "../components/profile/ProfileCard";
import ProfileForm from "../components/profile/ProfileForm";

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) return;
      const data = await getUserProfile(currentUser.uid);
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [currentUser]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      {profile ? (
        <>
          <ProfileCard profile={profile} />
          <button onClick={() => setEditing(!editing)} style={{ marginTop: "1rem" }}>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
          {editing && (
            <ProfileForm
              currentUser={currentUser}
              existingProfile={profile}
              onUpdate={() => {
                setEditing(false);
                getUserProfile(currentUser.uid).then(setProfile);
              }}
            />
          )}
        </>
      ) : (
        <ProfileForm
          currentUser={currentUser}
          onUpdate={() => {
            getUserProfile(currentUser.uid).then(setProfile);
          }}
        />
      )}
    </div>
  );
}