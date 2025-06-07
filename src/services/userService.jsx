

const API_BASE = "http://localhost:5000/api/users";

// Upload a profile or header image
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const data = await res.json();
  return data.imageUrl; // relative path like /uploads/filename.jpg
}

// Save or update a user's profile
export async function saveUserProfile(uid, profileData) {
  const res = await fetch(`${API_BASE}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, ...profileData }),
  });

  if (!res.ok) {
    throw new Error("Failed to save profile");
  }

  return await res.json();
}

// Fetch a user's profile
export async function getUserProfile(uid) {
  const res = await fetch(`${API_BASE}/${uid}`);

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to load profile");
  }

  return await res.json();
}