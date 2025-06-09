import { useEffect, useState } from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function DMList({ onSelectUser }) {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleClick = (user) => {
    if (user.uid !== currentUser?.uid) {
      onSelectUser(user);
    }
  };

  return (
    <ListGroup flush>
      {users.map((user) => (
        <ListGroupItem
          key={user.uid}
          onClick={() => handleClick(user)}
          className="cursor-pointer"
        >
          {user.displayName}
        </ListGroupItem>
      ))}
    </ListGroup>
  );
}