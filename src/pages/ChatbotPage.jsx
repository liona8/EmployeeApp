import React, { useState, useRef, useEffect } from 'react';
import { aiAgentService } from '../services/aiAgentService';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your Chin Hin Employee Assistant. I can help you with leave management, room bookings, and service tickets. How can I help you today?", 
      sender: 'bot' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [formData, setFormData] = useState({});
  const [userId] = useState('EMP001');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Process message through AI agent
      const response = await aiAgentService.processMessage(userInput, userId);
      
      console.log('📦 AI Agent Response:', response); // Debug log
      
      // SAFETY CHECK: Make sure response exists
      if (!response) {
        throw new Error('No response from AI agent');
      }
      
      let botResponse;
      
      // Check if response has intent (for multi-step forms)
      if (response.intent) {
        // If we need more information
        if (response.required_fields) {
          setCurrentIntent({
            intent: response.intent,
            fields: response.required_fields,
            currentField: 0,
            collectedData: {}
          });
          botResponse = response.message + '\n' + response.required_fields[0];
        } else {
          // Simple response with message
          botResponse = response.message || JSON.stringify(response, null, 2);
        }
      } 
      // Check if response has message directly
      else if (response.message) {
        botResponse = response.message;
      }
      // Otherwise, stringify the whole response
      else {
        botResponse = JSON.stringify(response, null, 2);
      }
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      // User-friendly error message
      let errorText = "Sorry, I encountered an error. ";
      
      if (error.message.includes('balance')) {
        errorText = "I couldn't fetch your leave balance. Please try again.";
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorText = "Connection issue. Please check your network and try again.";
      } else {
        errorText += "Please try again or contact support.";
      }
      
      const errorMessage = {
        id: messages.length + 2,
        text: errorText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmission = async (userInput) => {
    try {
      // Update collected data
      const updatedData = {
        ...currentIntent.collectedData,
        [currentIntent.fields[currentIntent.currentField]]: userInput
      };
      
      // Check if we have more fields to collect
      if (currentIntent.currentField + 1 < currentIntent.fields.length) {
        setCurrentIntent({
          ...currentIntent,
          currentField: currentIntent.currentField + 1,
          collectedData: updatedData
        });
        
        const nextField = currentIntent.fields[currentIntent.currentField + 1];
        const botMessage = {
          id: messages.length + 2,
          text: `Please provide: ${nextField}`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // All fields collected, execute the action
        const result = await aiAgentService.executeAction(currentIntent.intent, {
          ...updatedData,
          employee_id: userId,
          host_user_id: userId
        });
        
        const botMessage = {
          id: messages.length + 2,
          text: formatResponse(result),
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, botMessage]);
        setCurrentIntent(null); // Reset form state
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Error processing your request. Please try again.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentIntent(null);
    }
  };

  const formatResponse = (data) => {
    if (!data) return "No response data";
    
    if (typeof data === 'string') return data;
    
    try {
      // Format JSON responses nicely
      if (data.message) return data.message;
      
      // Format leave balance
      if (data.annual_leave) {
        return `Your leave balance:\n` +
               `📅 Annual: ${data.annual_leave.remaining || 0} days\n` +
               `🏥 Medical: ${data.medical_leave?.remaining || 0} days`;
      }
      
      // Format rooms
      if (data.rooms) {
        return `Available rooms: ${data.rooms.length}\n` +
               data.rooms.map(r => `• ${r.name}`).join('\n');
      }
      
      // Format tickets
      if (data.tickets) {
        return `You have ${data.tickets.length} active tickets.`;
      }
      
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return "Response received. Check the data for details.";
    }
  };

  const quickReplies = [
    'Check leave balance',
    'Apply for leave',
    'Search available rooms',
    'Book a meeting room',
    'Create service ticket',
    'My bookings',
    'Help'
  ];

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <h1>💬 Chin Hin Employee Assistant</h1>
        <span className="status">● Connected</span>
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
              <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
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