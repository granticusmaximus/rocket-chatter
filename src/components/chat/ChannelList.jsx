import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { ListGroup, ListGroupItem } from "reactstrap";

const socket = io("http://localhost:5000");

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

    socket.on("channelCreated", (newChannel) => {
      setChannels((prev) => [...prev, newChannel]);
    });

    return () => {
      socket.off("channelCreated");
    };
  }, []);

  return (
    <ListGroup flush>
      {channels.map((channel) => (
        <ListGroupItem
          key={channel.id}
          tag="button"
          action
          onClick={() => onSelectChannel(channel)}
        >
          {channel.name}
        </ListGroupItem>
      ))}
    </ListGroup>
  );
}