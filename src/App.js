import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const StreamingChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const botMessage = { sender: "bot", text: "", isStreaming: true };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(msg => [msg.sender, msg.text]);
      const response = await fetch("http://127.0.0.1:5000/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, history }),
      });

      if (!response.ok) throw new Error("Network response was not ok.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      const updateText = (newText) => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.sender === 'bot') {
            lastMsg.text = newText;
          }
          return updated;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        while (buffer.includes('\n')) {
          const newlineIndex = buffer.indexOf('\n');
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim(); // Remove 'data: ' prefix
            if (content && content !== fullResponse) {
              // Check if it's a new paragraph or bullet point
              if (content.startsWith('•') && !fullResponse.endsWith('\n')) {
                fullResponse += '\n';
              } else if (fullResponse.endsWith('\n') && !content.startsWith('•')) {
                fullResponse += '\n';
              }
              
              fullResponse = content;
              updateText(fullResponse);
              await new Promise(resolve => setTimeout(resolve, 20)); // Adjust timing as needed
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.startsWith('data: ')) {
        const content = buffer.slice(6).trim();
        if (content && content !== fullResponse) {
          fullResponse = content;
          updateText(fullResponse);
        }
      }

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.sender === 'bot') {
          lastMsg.text = "Error: Unable to fetch response.";
          lastMsg.isStreaming = false;
        }
        return updated;
      });
    } finally {
      setIsTyping(false);
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.sender === 'bot') {
          lastMsg.isStreaming = false;
        }
        return updated;
      });
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
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {msg.text}
            {msg.isStreaming && (
              <span className="typing-indicator"></span>
            )}
          </div>
        ))}
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about the Code of Alabama..."
          className="message-input"
        />
        <button
          onClick={handleSend}
          disabled={isTyping}
          className="send-button"
        >
          Ask
        </button>
      </div>
    </div>
  );
};

export default StreamingChat;