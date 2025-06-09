import { useState } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import CallControl from "../call/CallControl";
import GroupCallPanel from "../call/GroupCallPanel";
import { useChat } from "../../context/ChatContext";

export default function ChatWindow() {
  const { activeUser, activeChannel } = useChat();
  const [showGroupCall, setShowGroupCall] = useState(false);

  if (!activeUser && !activeChannel) {
    return (
      <Container fluid className="p-3">
        <p>Select a channel or user to start chatting</p>
      </Container>
    );
  }

  const headerTitle = activeUser
    ? `Chatting with ${activeUser.displayName}`
    : `Channel: ${activeChannel.name}`;

  return (
    <Container fluid className="d-flex flex-column h-100 border-start bg-white">
      <Row className="flex-grow-1 overflow-auto p-3">
        <Col>
          <div className="mb-3">
            <CallControl />
            <div className="d-flex justify-content-between align-items-center mt-2">
              <strong>{headerTitle}</strong>
              {activeChannel && (
                <Button
                  color={showGroupCall ? "danger" : "primary"}
                  onClick={() => setShowGroupCall(!showGroupCall)}
                >
                  {showGroupCall ? "End Group Call" : "Start Group Call"}
                </Button>
              )}
            </div>
          </div>
          <MessageList />
          {showGroupCall && (
            <GroupCallPanel
              channelId={activeChannel.id}
              onClose={() => setShowGroupCall(false)}
            />
          )}
        </Col>
      </Row>
      <Row className="border-top bg-light p-3">
        <Col>
          <MessageInput />
        </Col>
      </Row>
    </Container>
  );
}