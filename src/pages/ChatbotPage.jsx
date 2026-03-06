// chatbotPage.jsx 
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Camera, X } from "lucide-react";
import "./all.css";
import api from '../services/api';

const QUICK_ACTIONS = [
  "Check my leave balance",
  "Apply for annual leave",
  "Book a meeting room",
  "Show my upcoming bookings",
  "Create a service ticket",
  "What is my leave entitlement?",
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "ai",
    text: "Hi! I'm your Chin Hin Employee Assistant. I can help you with leave applications, room bookings, service tickets, and more.\n\nWhat can I help you with today?",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [threadId, setThreadId] = useState(null);
  
  // Photo upload state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Photo upload handler
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    const formData = new FormData();
    formData.append('file', file);

    setUploadingPhoto(true);

    try {
      const response = await api.post('/service-ticket/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedPhotoUrl(response.data.photo_url);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Photo upload failed';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setUploadedPhotoUrl(null);
  };

  const send = async (text) => {
    if ((!text.trim() && !uploadedPhotoUrl) || loading) return;
    
    // Build message text including photo mention
    let messageText = text.trim();
    if (uploadedPhotoUrl && messageText) {
      messageText = messageText + "\n\n[Photo attached]";
    } else if (uploadedPhotoUrl) {
      messageText = "[Photo attached]";
    }
    
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      photo_url: uploadedPhotoUrl,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post('/api/ai/chat', {
        message: text.trim(),
        user_id: 'EMP001',
        thread_id: threadId,
        photo_url: uploadedPhotoUrl,
      });

      setThreadId(response.data.thread_id);

      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: String(response.data.reply),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      const errMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: error.message || "Sorry, something went wrong.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      // Clear photo after sending
      setUploadedPhotoUrl(null);
      setPhotoPreview(null);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  // Render simple markdown-like formatting
  const renderText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code style="background:var(--bg3);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div style={{
        padding: "20px 32px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 36, height: 36,
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Sparkles size={18} color="white" />
        </div>
        <div>
          <div className="font-syne" style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
            Chin Hin AI Assistant
          </div>
          <div style={{ fontSize: 12, color: "var(--accent3)", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent3)" }} />
            Online
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text3)" }}>
          Powered by Azure AI Foundry
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className={`message-avatar ${msg.role}`}>
              {msg.role === "ai" 
                ? <Bot size={16} />
                : <User size={16} />
              }
            </div>
            <div>
              <div className="message-bubble">
                {renderText(msg.text)}
              </div>
              <div style={{
                fontSize: 10, color: "var(--text3)", marginTop: 4,
                textAlign: msg.role === "user" ? "right" : "left"
              }}>{msg.time}</div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="message ai">
            <div className="message-avatar ai">AI</div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {QUICK_ACTIONS.map((q) => (
          <button key={q} className="quick-action-chip" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        {/* Photo Preview */}
        {photoPreview && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            marginBottom: 10,
            padding: '8px 12px',
            background: 'var(--bg3)',
            borderRadius: 8,
            border: '1px solid var(--border)'
          }}>
            <img 
              src={photoPreview} 
              alt="Preview" 
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} 
            />
            <div style={{ flex: 1, fontSize: 12, color: 'var(--text2)' }}>
              {uploadingPhoto ? 'Uploading...' : (uploadedPhotoUrl ? 'Photo ready' : 'Processing...')}
            </div>
            <button
              onClick={clearPhoto}
              style={{
                background: 'rgba(248,113,113,0.9)',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
              title="Remove photo"
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        <div className="chat-input-wrap">
          {/* Hidden file input */}
          <input
            type="file"
            id="chatPhotoInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
          />
          
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about leave, room bookings, service tickets..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          
          {/* Camera button - beside send button */}
          <button
            onClick={() => document.getElementById('chatPhotoInput').click()}
            disabled={uploadingPhoto}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text2)',
              cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: uploadingPhoto ? 0.5 : 1,
              borderRadius: 8,
              transition: 'background 0.15s',
              marginRight: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Add photo"
          >
            <Camera size={20} />
          </button>
          
          <button
            className="chat-send-btn"
            onClick={() => send(input)}
            disabled={(!input.trim() && !uploadedPhotoUrl) || loading}
          >
            <Send size={16} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6, textAlign: "center" }}>
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}