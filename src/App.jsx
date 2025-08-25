import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function App() {
  const [rooms] = useState(["room1", "room2", "room3"]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState({});

  useEffect(() => {
    // Listen for messages
    socket.on("message", (msg) => {
      const room = msg.room || currentRoom;
      setMessages(prev => ({
        ...prev,
        [room]: [...(prev[room] || []), msg]
      }));
    });

    // Listen for room history when joining
    socket.on("room_messages", ({ room, messages: msgs }) => {
      setMessages(prev => ({ ...prev, [room]: msgs }));
    });

    return () => socket.off();
  }, [currentRoom]);

  const joinRoom = (room) => {
    if (!joinedRooms.includes(room)) {
      socket.emit("join_room", room);
      setJoinedRooms([...joinedRooms, room]);
    }
    setCurrentRoom(room);
  };

  const sendMessage = () => {
    if (!text || !currentRoom) return;
    socket.emit("send_message", { room: currentRoom, text });
    setText("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Multi-Room Chat</h2>

      <div>
        <strong>Rooms:</strong>
        {rooms.map(r => (
          <button
            key={r}
            onClick={() => joinRoom(r)}
            style={{ margin: "0 5px", fontWeight: currentRoom === r ? "bold" : "normal" }}
          >
            {r}
          </button>
        ))}
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          height: "200px",
          overflowY: "auto",
          marginTop: "10px",
          padding: "10px"
        }}
      >
        {messages[currentRoom]?.map((m, i) => (
          <div key={i}>
            {m.system ? m.text : `${m.user}: ${m.text}`}
          </div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
