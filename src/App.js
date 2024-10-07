import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Import axios
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null); // Ref for the chat box to handle scroll

  const handleSend = async () => {
    if (input.trim()) {
      // Add user's message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: input },
      ]);

      try {
        // Prepare the conversation history to send to the server
        const history = messages.map((msg) => [msg.sender, msg.text]);

        // Make a POST request to the Flask API
        const response = await axios.post("http://127.0.0.1:5000/api", {
          input: input,  // Send the user's input
          history: history, // Send the conversation history
        });

        // Handle the response from the API
        const botResponse = response.data.response || "An error occurred. Please try again.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: botResponse },
        ]);
      } catch (error) {
        // Handle error in case of failure
        console.error("API call failed:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Error: Unable to fetch response." },
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

      {/* Chat box */}
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

      {/* Input container */}
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
