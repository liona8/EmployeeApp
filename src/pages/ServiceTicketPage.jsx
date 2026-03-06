import { useState, useEffect } from "react";
import { ticketService } from "../services/ticketService";
import api from "../services/api";
import {
  Wind, Lightbulb, Droplets, Monitor, Zap, Wrench,
  Building2, Layers, DoorOpen, Clock, MapPin, Tag,
  User, Paperclip, AlertTriangle, Search, Plus, Camera, X
} from "lucide-react";

const CATEGORY_CONFIG = {
  AC:          { icon: Wind,      color: "#60a5fa", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.22)" },
  Lighting:    { icon: Lightbulb, color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.22)" },
  Plumbing:    { icon: Droplets,  color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)" },
  IT:          { icon: Monitor,   color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.22)" },
  Electrical:  { icon: Zap,       color: "#fb923c", bg: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.22)" },
  Other:       { icon: Wrench,    color: "#8892aa", bg: "rgba(136,146,170,0.10)", border: "rgba(136,146,170,0.22)" },
};

const STATUS_CONFIG = {
  "Open":        { color: "#f87171", bg: "rgba(248,113,113,0.10)", dot: "#f87171" },
  "In Progress": { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  dot: "#fbbf24" },
  "Resolved":    { color: "#34d399", bg: "rgba(52,211,153,0.10)",  dot: "#34d399" },
  "Closed":      { color: "#555f78", bg: "rgba(85,95,120,0.10)",   dot: "#555f78" },
};

const PRIORITY_CONFIG = {
  High:   { color: "#f87171", bg: "rgba(248,113,113,0.10)" },
  Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)"  },
  Low:    { color: "#34d399", bg: "rgba(52,211,153,0.10)"  },
};

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-MY", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getSlaStatus(ticket) {
  const created  = new Date(ticket.created_at);
  const deadline = new Date(created.getTime() + ticket.sla_hours * 3_600_000);
  const now      = new Date();
  if (ticket.status === "Resolved" || ticket.status === "Closed")
    return { label: "SLA Met", color: "#34d399", overdue: false };
  if (now > deadline) {
    const h = Math.max(1, Math.floor((now - deadline) / 3_600_000));
    return { label: `Overdue ${h}h`, color: "#f87171", overdue: true };
  }
  const h = Math.floor((deadline - now) / 3_600_000);
  return { label: `${h}h left`, color: "#fbbf24", overdue: false };
}

// ── Detail Drawer ──────────────────────────────────────────────────────────────
function TicketDrawer({ ticket, onClose }) {
  if (!ticket) return null;
  const cat  = CATEGORY_CONFIG[ticket.category]  || CATEGORY_CONFIG.Other;
  const stat = STATUS_CONFIG[ticket.status]       || STATUS_CONFIG["Open"];
  const pri  = PRIORITY_CONFIG[ticket.priority]   || PRIORITY_CONFIG.Medium;
  const sla  = getSlaStatus(ticket);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 100, backdropFilter: "blur(5px)", display: "flex", justifyContent: "flex-end" }}
      onClick={onClose}
    >
      <div
        style={{ width: 460, height: "100%", background: "var(--bg2)", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "var(--bg3)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ padding: "4px 10px", borderRadius: 100, background: cat.bg, border: `1px solid ${cat.border}`, fontSize: 11, fontWeight: 600, color: cat.color, display: "flex", alignItems: "center", gap: 5 }}>
                <cat.icon size={12} strokeWidth={2.2} /> {ticket.category}
              </div>
              <div style={{ padding: "4px 10px", borderRadius: 100, background: pri.bg, fontSize: 11, fontWeight: 600, color: pri.color }}>{ticket.priority}</div>
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.35 }}>{ticket.issue_title}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{ticket.id}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text2)", cursor: "pointer", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginLeft: 12 }}>×</button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stat.dot }} />
                <span style={{ color: stat.color, fontWeight: 600, fontSize: 13 }}>{ticket.status}</span>
              </div>
            </div>
            <div style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>SLA ({ticket.sla_hours}h)</div>
              <div style={{ color: sla.color, fontWeight: 600, fontSize: 13 }}>{sla.label}</div>
            </div>
          </div>

          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65 }}>{ticket.description}</div>
          </div>

          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                [<Building2 size={12} />, "Building", ticket.location.building],
                [<Layers    size={12} />, "Floor",    ticket.location.floor],
                [<DoorOpen  size={12} />, "Room",     ticket.location.room],
              ].map(([ico, label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>{ico} {label}</div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Assignment</div>
            {ticket.assigned_to ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent3), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                  {ticket.assigned_to.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{ticket.assigned_to}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Assigned team</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>Not yet assigned</div>
            )}
          </div>

          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Timeline</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["Created", ticket.created_at], ["Last Updated", ticket.updated_at]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>{k}</span>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{formatDate(v)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Attachment</div>
            {ticket.photo_url ? (
              <img src={ticket.photo_url} alt="ticket" style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)" }} />
            ) : (
              <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: "24px", textAlign: "center", color: "var(--text3)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Paperclip size={20} strokeWidth={1.5} />
                No photo attached
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

// ── New Ticket Modal (wired to real API) ───────────────────────────────────────
function getOrdinalSuffix(n) {
  const num = parseInt(n, 10);
  if (isNaN(num) || num < 1) return "";
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (num % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatFloor(n) {
  const num = parseInt(n, 10);
  if (isNaN(num) || num < 1) return "";
  return `${num}${getOrdinalSuffix(num)} Floor`;
}

function NewTicketModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    issue_title: "", description: "",
    category: "AC", priority: "Medium",
    room: "", floorNum: "", building: "HQ Tower",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  
  // Photo upload state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Only allow positive integers in the floor number field
  const handleFloorChange = (e) => {
    const raw = e.target.value.replace(/\D/g, ""); // strip non-digits
    up("floorNum", raw ? String(parseInt(raw, 10)) : "");
  };

  const floorDisplay = form.floorNum ? formatFloor(form.floorNum) : "";
  const valid = form.issue_title && form.description && form.room && form.floorNum;

  // Photo upload handler
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
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
    setError(null);

    try {
      const response = await api.post('/service-ticket/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedPhotoUrl(response.data.photo_url);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Photo upload failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setUploadedPhotoUrl(null);
  };

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      // Build the payload in the shape the backend expects
      const newTicket = await ticketService.createTicket({
        employee_id: "EMP001",           // Replace with real logged-in user ID
        issue_title: form.issue_title,
        description: form.description,
        category:    form.category,
        priority:    form.priority,
        location: {
          room:     form.room,
          floor:    floorDisplay,
          building: form.building,
        },
        photo_url: uploadedPhotoUrl,
      });

      // Pass the real ticket back up to the list
      onSuccess(newTicket);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to submit ticket. Please try again.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: 500, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>New Service Ticket</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Report a facility or IT issue</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text2)", cursor: "pointer", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>×</button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#f87171" }}>
            ⚠ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Issue Title *</label>
          <input className="form-input" placeholder="Brief description of the issue" value={form.issue_title} onChange={e => up("issue_title", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" placeholder="Describe the problem in detail..." value={form.description} onChange={e => up("description", e.target.value)} style={{ minHeight: 90 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => up("category", e.target.value)}>
              {Object.keys(CATEGORY_CONFIG).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={form.priority} onChange={e => up("priority", e.target.value)}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Room *</label>
            <input className="form-input" placeholder="e.g. Meeting Room B" value={form.room} onChange={e => up("room", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Floor *</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                placeholder="e.g. 5"
                inputMode="numeric"
                value={form.floorNum}
                onChange={handleFloorChange}
                style={{ paddingRight: floorDisplay ? 110 : 12 }}
              />
              {floorDisplay && (
                <span style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  fontSize: 12, fontWeight: 600, color: "var(--accent)",
                  pointerEvents: "none", whiteSpace: "nowrap",
                }}>
                  → {floorDisplay}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Building</label>
          <input className="form-input" value={form.building} onChange={e => up("building", e.target.value)} />
        </div>

        {/* Photo Upload Section */}
        <div className="form-group">
          <label className="form-label">Attachment (Optional)</label>
          
          {/* Hidden file input */}
          <input
            type="file"
            id="photoInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
          />
          
          {/* Photo preview or upload button */}
          {photoPreview ? (
            <div style={{ 
              position: 'relative', 
              display: 'inline-block',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 8,
              background: 'var(--bg3)'
            }}>
              <img 
                src={photoPreview} 
                alt="Preview" 
                style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: 8, display: 'block' }} 
              />
              <button
                onClick={clearPhoto}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
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
              {uploadedPhotoUrl && (
                <div style={{ fontSize: 11, color: 'var(--accent3)', marginTop: 6, textAlign: 'center' }}>
                  Photo uploaded successfully
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => document.getElementById('photoInput').click()}
              disabled={uploadingPhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'var(--bg3)',
                border: '1px dashed var(--border)',
                borderRadius: 8,
                color: 'var(--text2)',
                cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                fontSize: 13,
                opacity: uploadingPhoto ? 0.6 : 1
              }}
            >
              <Camera size={16} />
              {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!valid || submitting}
            style={{ opacity: (!valid || submitting) ? 0.45 : 1, cursor: (!valid || submitting) ? "not-allowed" : "pointer", minWidth: 120 }}
          >
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ServiceTicketsPage() {
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [showNew, setShowNew]       = useState(false);
  const [filterStatus, setStatus]   = useState("All");
  const [filterCat, setCat]         = useState("All");
  const [filterPri, setPri]         = useState("All");
  const [search, setSearch]         = useState("");

  const statuses   = ["All", "Open", "In Progress", "Resolved", "Closed"];
  const categories = ["All", ...Object.keys(CATEGORY_CONFIG)];
  const priorities = ["All", "High", "Medium", "Low"];

  const filtered = (tickets || []).filter(t => {
    if (!t) return false;
    if (filterStatus !== "All" && t.status   !== filterStatus) return false;
    if (filterCat    !== "All" && t.category !== filterCat)    return false;
    if (filterPri    !== "All" && t.priority !== filterPri)    return false;
    if (search && !t.issue_title?.toLowerCase().includes(search.toLowerCase()) &&
                  !t.id?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await ticketService.listEmployeeTickets("EMP001");
        // Handle different response structures defensively
        const ticketList = data?.tickets || data || [];
        setTickets(Array.isArray(ticketList) ? ticketList : []);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const counts = {
    open:       (tickets || []).filter(t => t?.status === "Open").length,
    inProgress: (tickets || []).filter(t => t?.status === "In Progress").length,
    resolved:   (tickets || []).filter(t => t?.status === "Resolved").length,
    closed:     (tickets || []).filter(t => t?.status === "Closed").length,
  };

  // Called after a successful API create — prepend the real ticket from the DB
  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">Service Tickets</div>
            <div className="page-subtitle">Track and manage facility & IT issue reports</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} strokeWidth={2.5} /> New Ticket
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "0 32px", marginBottom: 22 }}>
        {[
          { label: "Open",        val: counts.open,       color: "red"    },
          { label: "In Progress", val: counts.inProgress, color: "orange" },
          { label: "Resolved",    val: counts.resolved,   color: "green"  },
          { label: "Closed",      val: counts.closed,     color: "gray"   },
        ].map(s => (
          <div
            key={s.label}
            className="stat-card"
            style={{ cursor: "pointer", paddingTop: 18, paddingBottom: 18 }}
            onClick={() => setStatus(s.label === filterStatus ? "All" : s.label)}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: { red: "var(--danger)", orange: "var(--warning)", green: "var(--accent3)", gray: "var(--text3)" }[s.color] }} />
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: "var(--text)", margin: "4px 0 2px" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>tickets</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ padding: "0 32px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", pointerEvents: "none" }} />
          <input className="form-input" style={{ width: "100%", paddingLeft: 30 }} placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {statuses.map(s => {
            const sc = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setStatus(s)} style={{ background: filterStatus === s ? (sc?.bg || "rgba(91,124,250,0.12)") : "var(--bg2)", border: `1px solid ${filterStatus === s ? (sc?.dot || "var(--accent)") : "var(--border)"}`, color: filterStatus === s ? (sc?.color || "var(--accent)") : "var(--text2)", borderRadius: 100, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                {sc && <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />}
                {s}
              </button>
            );
          })}
        </div>
        <select className="form-select" style={{ width: 130 }} value={filterCat} onChange={e => setCat(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-select" style={{ width: 120 }} value={filterPri} onChange={e => setPri(e.target.value)}>
          {priorities.map(p => <option key={p}>{p}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: "auto" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Ticket List */}
      {loading && (
        <div style={{ padding: "32px", textAlign: "center", color: "var(--text3)" }}>Loading tickets…</div>
      )}

      <div style={{ padding: "0 32px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text3)", fontSize: 14, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12 }}>
            No tickets found matching your filters.
          </div>
        )}

        {filtered.map(ticket => {
          const cat  = CATEGORY_CONFIG[ticket.category]  || CATEGORY_CONFIG.Other;
          const stat = STATUS_CONFIG[ticket.status]       || STATUS_CONFIG["Open"];
          const pri  = PRIORITY_CONFIG[ticket.priority]   || PRIORITY_CONFIG.Medium;
          const sla  = getSlaStatus(ticket);

          return (
            <div
              key={ticket.id}
              onClick={() => setSelected(ticket)}
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 14, alignItems: "center", transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(91,124,250,0.4)"; e.currentTarget.style.background = "var(--bg3)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";          e.currentTarget.style.background = "var(--bg2)"; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <cat.icon size={18} color={cat.color} strokeWidth={1.8} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{ticket.issue_title}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 100, background: pri.bg, color: pri.color, fontSize: 11, fontWeight: 600 }}>{ticket.priority}</span>
                  {sla.overdue && (
                    <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <AlertTriangle size={10} strokeWidth={2.5} /> {sla.label}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--text3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} strokeWidth={2} /> {ticket.location.room}, {ticket.location.floor}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Tag size={11} strokeWidth={2} /> {ticket.category}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "monospace" }}>{ticket.id}</span>
                  <span style={{ fontSize: 12, color: "var(--text3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Clock size={11} strokeWidth={2} /> {timeAgo(ticket.created_at)}
                  </span>
                  {ticket.assigned_to && (
                    <span style={{ fontSize: 12, color: "var(--accent3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <User size={11} strokeWidth={2} /> {ticket.assigned_to}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <div style={{ padding: "4px 12px", borderRadius: 100, background: stat.bg, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: stat.dot }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: stat.color }}>{ticket.status}</span>
                </div>
                <span style={{ fontSize: 11, color: sla.color }}>{sla.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <TicketDrawer ticket={selected} onClose={() => setSelected(null)} />}

      {/* Pass onSuccess (not onSubmit) — called only after API succeeds */}
      {showNew && (
        <NewTicketModal
          onClose={() => setShowNew(false)}
          onSuccess={handleTicketCreated}
        />
      )}
    </div>
  );
}