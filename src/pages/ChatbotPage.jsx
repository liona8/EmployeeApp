// chatbotPage.jsx 
import { useState, useRef, useEffect } from "react";
import "./all.css";

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post('/api/ai/chat', {
        message: text.trim(),
        user_id: 'EMP001'
      });

      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: response.data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      const errMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: "Sorry, I'm having trouble connecting. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
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
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16
        }}>◈</div>
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
              {msg.role === "ai" ? "AI" : "A"}
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
        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about leave, room bookings, service tickets..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
          >
            ↑
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6, textAlign: "center" }}>
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}