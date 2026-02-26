import React, { useState, useRef, useEffect } from 'react';
import { aiAgentService } from '../services/aiAgentService';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Chin Hin Employee Assistant. I can help you with leave management, room bookings, and service tickets. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [userId] = useState('EMP001');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { id: messages.length + 1, text: inputText, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiAgentService.processMessage(userInput, userId);
      let botResponse;

      if (response.intent) {
        if (response.required_fields) {
          setCurrentIntent({ intent: response.intent, fields: response.required_fields, currentField: 0, collectedData: {} });
          botResponse = response.message + '\n' + response.required_fields[0];
        } else {
          botResponse = response.message || JSON.stringify(response, null, 2);
        }
      } else if (response.message) {
        botResponse = response.message;
      } else {
        botResponse = JSON.stringify(response, null, 2);
      }

      const botMessage = { id: messages.length + 2, text: botResponse, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage = { id: messages.length + 2, text: "Sorry, I encountered an error. Please try again.", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmission = async (userInput) => {
    try {
      const updatedData = { ...currentIntent.collectedData, [currentIntent.fields[currentIntent.currentField]]: userInput };

      if (currentIntent.currentField + 1 < currentIntent.fields.length) {
        setCurrentIntent({ ...currentIntent, currentField: currentIntent.currentField + 1, collectedData: updatedData });
        const nextField = currentIntent.fields[currentIntent.currentField + 1];
        setMessages(prev => [...prev, { id: messages.length + 2, text: `Please provide: ${nextField}`, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } else {
        const result = await aiAgentService.executeAction(currentIntent.intent, { ...updatedData, employee_id: userId, host_user_id: userId });
        setMessages(prev => [...prev, { id: messages.length + 2, text: formatResponse(result), sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setCurrentIntent(null);
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      setMessages(prev => [...prev, { id: messages.length + 2, text: "Error processing your request. Please try again.", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setCurrentIntent(null);
    }
  };

  const formatResponse = (data) => {
    if (!data) return "No response data";
    if (typeof data === 'string') return data;
    try {
      if (data.message) return data.message;
      if (data.annual_leave) return `Your leave balance:\n📅 Annual: ${data.annual_leave.remaining || 0} days\n🏥 Medical: ${data.medical_leave?.remaining || 0} days`;
      if (data.rooms) return `Available rooms:\n` + data.rooms.map(r => `• ${r.name}`).join('\n');
      if (data.tickets) return `You have ${data.tickets.length} active tickets.`;
      return JSON.stringify(data, null, 2);
    } catch {
      return "Response received. Check the data for details.";
    }
  };

  const quickReplies = ['Check leave balance','Apply for leave','Search available rooms','Book a meeting room','Create service ticket','My bookings','Help'];

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <h1>💬 Chin Hin Employee Assistant</h1>
        <span className="status">● Connected</span>
      </div>

      <div className="quick-replies">
        {quickReplies.map((reply, index) => (
          <button key={index} className="quick-reply-btn" onClick={() => setInputText(reply)}>{reply}</button>
        ))}
      </div>

      <div className="messages-area">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
              <span className="message-time">{message.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-area">
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type your message..." className="chat-input" />
        <button type="submit" className="send-btn" disabled={!inputText.trim()}>Send</button>
      </form>
    </div>
  );
};

export default ChatbotPage;