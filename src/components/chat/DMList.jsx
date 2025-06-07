

import { useAuth } from "../../context/AuthContext";

export default function DMList({ onSelectUser }) {
  const { currentUser } = useAuth();

  const dummyUsers = [
    { uid: "user1", displayName: "Alice" },
    { uid: "user2", displayName: "Bob" },
  ];

  const handleClick = (user) => {
    if (user.uid !== currentUser?.uid) {
      onSelectUser(user);
    }
  };

  return (
    <div>
      {dummyUsers.map((user) => (
        <div
          key={user.uid}
          style={styles.item}
          onClick={() => handleClick(user)}
        >
          {user.displayName}
        </div>
      ))}
    </div>
  );
}

const styles = {
  item: {
    padding: "0.5rem",
    cursor: "pointer",
    borderBottom: "1px solid #ddd",
  },
};