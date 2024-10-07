import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Import Axios
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null);

  const handleSend = async () => {
    if (input.trim()) {
      // Add user's message
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: input },
      ]);

      try {
        // Make API call to Flask backend
        const response = await axios.post("http://localhost:5000/get_response", {
          input: input,
          history: messages.map(msg => [msg.sender, msg.text]) 
        });

        // Get the response from the backend
        const botResponse = response.data.response;

        // Add bot's message
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: botResponse },
        ]);
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Sorry, there was an error processing your request." },
        ]);
      }

      setInput(""); // Clear input field
    }
  };

  // Scroll to bottom whenever new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container">
      <h1>Ask ALI</h1>
      <h2>Code of Alabama AI Assistant Beta</h2>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "user" ? "user-message" : "bot-message"}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about the Code of Alabama..."
          className="message-input"
        />
        <button onClick={handleSend} className="send-button">
          Ask
        </button>
      </div>
    </div>
  );
}

export default App;
