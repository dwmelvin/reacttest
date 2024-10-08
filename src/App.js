import React, { useState, useEffect, useRef } from "react";
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

      // Clear input field right after sending the message
      setInput("");

      try {
        // Prepare the conversation history to send to the server
        const history = messages.map((msg) => [msg.sender, msg.text]);

        // Make a POST request to the Flask API using fetch to handle streaming
        const response = await fetch("http://127.0.0.1:5000/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: input, history: history }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the stream chunk and accumulate it
          partialResponse += decoder.decode(value, { stream: true });

          // Parse and extract the "data: " part
          const parts = partialResponse.split("\n\n");
          parts.forEach((part) => {
            if (part.startsWith("data: ")) {
              const message = part.replace("data: ", "").trim();
              setMessages((prevMessages) => [
                ...prevMessages.filter((msg) => msg.sender !== "bot"),
                { sender: "bot", text: message },
              ]);
            }
          });

          partialResponse = ""; // Clear for the next chunks
        }
      } catch (error) {
        console.error("Error:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Error: Unable to fetch response." },
        ]);
      }
    }
  };

  // Handle key press events in the input field
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
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
          onKeyDown={handleKeyPress} // Add onKeyDown event listener
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
