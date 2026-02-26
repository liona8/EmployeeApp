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

// Simulated AI responses
function generateResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes("leave balance")) {
    return `**Your Leave Balance (EMP001 - Ahmad Razif)**\n\n📅 Annual Leave: **13 days** remaining (5 used / 18 entitlement)\n🏥 Medical Leave: **12 days** remaining (2 used / 14 entitlement)\n💼 Compassionate Leave: **3 days** available\n↩ Carry Forward: **3 days** (expires Jun 30, 2026)\n\nWould you like to apply for leave or check specific leave policies?`;
  }
  if (lower.includes("apply") && lower.includes("annual")) {
    return `To apply for annual leave, I'll need the following details:\n\n1. **Start date** (YYYY-MM-DD)\n2. **End date** (YYYY-MM-DD)\n3. **Reason** (optional)\n\nPlease note: Annual leave requires **minimum 5 working days advance notice**. Would you like to proceed? You can also use the Leave Management page for a full form.`;
  }
  if (lower.includes("book") && lower.includes("room")) {
    return `I can help you book a meeting room! Here's what I need:\n\n📅 **Date**: What date do you need the room?\n⏰ **Time**: What time should the meeting start?\n⏱ **Duration**: How long is the meeting?\n👥 **Capacity**: How many attendees?\n🛠 **Amenities**: Any required equipment (projector, video conferencing, etc.)?\n\nAlternatively, use the Calendar page to browse availability visually.`;
  }
  if (lower.includes("upcoming booking")) {
    return `**Your Upcoming Room Bookings**\n\n🏢 **BKG-20260228-001**\n   Boardroom A · Feb 28, 2026 · 10:00 AM – 11:00 AM\n   Q1 Sprint Planning\n\n🏢 **BKG-20260303-002**\n   Meeting Room 3B · Mar 3, 2026 · 2:00 PM – 3:30 PM\n   Design Review\n\nWould you like to modify or cancel any of these bookings?`;
  }
  if (lower.includes("service ticket") || lower.includes("maintenance")) {
    return `To create a service ticket, please provide:\n\n🔧 **Issue Title**: Brief description\n📝 **Description**: Detailed explanation\n📂 **Category**: AC / Lighting / Plumbing / IT / Other\n⚡ **Priority**: Low / Medium / High\n📍 **Location**: Room and floor number\n\nWhat issue would you like to report?`;
  }
  if (lower.includes("entitlement") || lower.includes("policy")) {
    return `**Your Leave Entitlement (Grade 16, Permanent, 4.5 years)**\n\n📅 Annual Leave: **18 days/year** (2–5 years band)\n🏥 Medical Leave: **14 days/year**\n🏥 Hospitalization: Up to **60 days/year**\n❤️ Compassionate: **3 days/occurrence** (max 9/year)\n👶 Paternity: **7 consecutive days** (up to 5 confinements)\n\nNote: Annual leave requires **5 working days** advance notice. Emergency leave must be notified by **9:00 AM**.`;
  }
  if (lower.includes("hello") || lower.includes("hi")) {
    return `Hello! 👋 I'm ready to assist you with:\n\n• **Leave management** — apply, check balances, view history\n• **Room bookings** — search availability, book, modify\n• **Service tickets** — report issues, track status\n• **Policy info** — entitlements, rules, deadlines\n\nWhat would you like to do?`;
  }
  return `I understand you're asking about "${input}". Let me help with that!\n\nCurrently I can assist with:\n\n• Leave applications & balance checks\n• Room booking & availability search\n• Service ticket creation\n• HR policy information\n\nFor complex requests, connect this chat to the backend API at \`/api/ai/chat\`. What specific information do you need?`;
}

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
      const response = await api.post("/api/ai/chat", {
        message: text.trim(),
        // pass conversation history if your agent supports multi-turn
        history: messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
      });

      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: response.data.reply, // adjust key to match your API response shape
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: `⚠️ Error: ${error.message}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
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