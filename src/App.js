import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);

  const handleAsk = async () => {
    if (query.trim()) {
      // Add the user's question to the conversation
      const newMessages = [...messages, { type: 'user', text: query }];
      setMessages(newMessages);

      try {
        const res = await fetch('http://localhost:7860/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: query }),
        });

        if (res.ok) {
          const data = await res.json();
          // Add the bot's response to the conversation
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'bot', text: data.answer }
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'bot', text: 'Error: Failed to fetch the response.' }
          ]);
        }
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: 'Error: Unable to reach the server.' }
        ]);
      } finally {
        setQuery(''); // Clear the input field
      }
    }
  };

  return (
    <div className="container">
      <h1 className="main-title">Ask ALI</h1>
      <h2 className="subtitle">Code of Alabama AI Assistant Beta</h2>
      <div className="conversation-box">
        {messages.length === 0 && <p>Awaiting your question...</p>}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="query-input-container">
        <input
          type="text"
          placeholder="Ask ALI..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="query-input"
        />
        <button onClick={handleAsk} className="ask-button"></button>
      </div>
    </div>
  );
}

export default App;
