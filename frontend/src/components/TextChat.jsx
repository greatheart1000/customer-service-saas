import React, { useState, useRef, useEffect } from 'react';
import './TextChat.css';

const TextChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your intelligent customer service assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate API call delay
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: `I received your message: "${inputValue}". This is a simulated response from the AI assistant. In a real implementation, this would be generated based on your actual input. How else can I assist you?`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your intelligent customer service assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setInputValue('');
    setIsLoading(false);
  };

  return (
    <div className="text-chat">
      <h1>💬 Text Chat</h1>
      <p className="subtitle">Chat with our AI assistant in real-time</p>
      
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input" onSubmit={handleSend}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            Send
          </button>
          <button 
            type="button" 
            className="reset-button"
            onClick={handleReset}
          >
            Reset
          </button>
        </form>
      </div>
      
      <div className="info-section">
        <h3>Features</h3>
        <ul>
          <li>Real-time conversation with AI assistant</li>
          <li>Message history preservation</li>
          <li>Typing indicators for better UX</li>
          <li>Responsive design for all devices</li>
        </ul>
      </div>
    </div>
  );
};

export default TextChat;