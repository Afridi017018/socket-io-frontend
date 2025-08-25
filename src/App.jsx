import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to backend server
const socket = io("http://localhost:5000");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for chat messages from server
    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup
    return () => {
      socket.off("chat_message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("chat_message", message); // send to server
    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Simple Chat</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "200px",
          overflowY: "auto",
          marginBottom: "10px"
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
