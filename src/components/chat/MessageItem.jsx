import { Card, CardBody, CardTitle } from "reactstrap";
import classNames from "classnames";
import { useChat } from "../../context/ChatContext";

export default function MessageItem({ message, currentUserId }) {
  const { sender, senderId, text, timestamp } = message;

  const { readMessages } = useChat();

  const isCurrentUser = senderId === currentUserId;

  const isRead = readMessages.includes(message.id);

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString()
    : "";

  return (
    <div
      className={classNames("d-flex", {
        "justify-content-end": isCurrentUser,
        "justify-content-start": !isCurrentUser,
      })}
    >
      <Card
        className={classNames("mb-2", {
          "bg-primary text-white": isCurrentUser,
          "bg-light": !isCurrentUser,
        })}
        style={{ maxWidth: "75%" }}
      >
        <CardBody>
          <div className="d-flex justify-content-between">
            <CardTitle tag="h6" className="mb-1">
              {sender}
            </CardTitle>
            <small className="text-muted">{formattedTime}</small>
          </div>
          <p className="mb-0">{text}</p>
          {isCurrentUser && (
            <small className="text-end d-block mt-1 text-white-50">
              {isRead ? "✔✔ Seen" : "✔ Sent"}
            </small>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
