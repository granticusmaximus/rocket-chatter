import { useEffect, useState } from "react";
import axios from "axios";

export default function ChannelList({ onSelectChannel }) {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?.uid) return;

    axios
      .get(`http://localhost:5000/api/channels/${currentUser.uid}`)
      .then((res) => {
        setChannels(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch channels:", err);
      });
  }, []);

  return (
    <div>
      {channels.map((channel) => (
        <div
          key={channel.id}
          style={styles.item}
          onClick={() => onSelectChannel(channel)}
        >
          {channel.name}
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