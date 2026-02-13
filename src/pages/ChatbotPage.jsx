import React, { useState, useRef, useEffect } from 'react';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputText),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (input) => {
    const text = input.toLowerCase();
    if (text.includes('leave') || text.includes('vacation')) 
      return "You have 15 vacation days remaining. Would you like to apply for leave?";
    if (text.includes('salary') || text.includes('pay')) 
      return "Your next paycheck is on the 30th. Your basic salary is $5,000.";
    if (text.includes('meeting') || text.includes('schedule')) 
      return "Your next meeting is 'Team Standup' at 10:00 AM today.";
    if (text.includes('task') || text.includes('todo')) 
      return "You have 5 pending tasks. The priority task is 'Complete Q4 report'.";
    if (text.includes('holiday') || text.includes('holidays')) 
      return "Next holiday is Thanksgiving on November 23rd.";
    if (text.includes('hr') || text.includes('human resources')) 
      return "You can contact HR at hr@company.com or ext. 4500.";
    return "I'll help you with that. Could you please provide more details?";
  };

  const quickReplies = [
    'Apply for leave',
    'Check salary',
    'My schedule',
    'HR policies',
    'IT support'
  ];

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <h1>💬 Employee Assistant</h1>
        <span className="status">● Online</span>
      </div>

      <div className="quick-replies">
        {quickReplies.map((reply, index) => (
          <button 
            key={index} 
            className="quick-reply-btn"
            onClick={() => setInputText(reply)}
          >
            {reply}
          </button>
        ))}
      </div>

      <div className="messages-area">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">{message.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="send-btn" disabled={!inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatbotPage;