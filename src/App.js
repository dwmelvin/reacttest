import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './index.css';

const StreamingChatComponent = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const chatBoxRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const history = messages.map((msg) => [msg.sender, msg.text]);
      const response = await fetch("http://127.0.0.1:5000/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, history }),
      });

      if (!response.ok) throw new Error("Network response was not ok.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let botMessage = { sender: "bot", text: "" };
      setMessages((prev) => [...prev, botMessage]);

      let buffer = "";
      let lastCompleteWord = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split buffer into words
        const words = buffer.split(' ');
        
        // The last word might be incomplete, so we keep it in the buffer
        buffer = words.pop() || "";
        
        // Join complete words and update the message
        if (words.length > 0) {
          lastCompleteWord = words.join(' ');
          botMessage.text = lastCompleteWord;
          setMessages((prev) => [...prev.slice(0, -1), { ...botMessage }]);
        }
      }

      // Process any remaining content in the buffer
      if (buffer) {
        botMessage.text = lastCompleteWord + ' ' + buffer;
        setMessages((prev) => [...prev.slice(0, -1), { ...botMessage }]);
      }

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { sender: "bot", text: "Sorry, an error occurred. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

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
            className={`${msg.sender}-message`}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {msg.text}
          </div>
        ))}
        {isThinking && (
          <div className="bot-message">
            <span className="typing-indicator"></span>
          </div>
        )}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything about the Code of Alabama..."
          className="message-input"
        />
        <button onClick={handleSend} disabled={isThinking} className="send-button">
          Ask
        </button>
      </div>
    </div>
  );
};

export default StreamingChatComponent;