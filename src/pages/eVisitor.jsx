import { useState } from "react";
import { UserPlus, QrCode, Clock, CheckCircle, XCircle, Search, ChevronRight, X } from "lucide-react";

// ─── Hardcoded data ──────────────────────────────────────────────────────────
const EMPLOYEES = [
  { id: "EMP001", name: "Kueh Wei", department: "Engineering" },
  { id: "EMP002", name: "Alan Tan Wai Loon", department: "Management" },
  { id: "EMP003", name: "Siti Norzahra", department: "HR" },
  { id: "EMP004", name: "Jason Lim", department: "Finance" },
  { id: "EMP005", name: "Priya Menon", department: "Legal" },
];

const INITIAL_VISITORS = [
  {
    id: "VIS-20260307-A1B2",
    name: "Ahmad Rizal bin Hassan",
    ic: "850312-14-5678",
    phone: "+60 12-345 6789",
    email: "ahmad.rizal@example.com",
    company: "Mega Supplies Sdn Bhd",
    purpose: "Meeting",
    host: "Alan Tan Wai Loon",
    visitDate: "2026-03-07",
    status: "approved",
    registeredAt: "2026-03-07 08:45",
  },
  {
    id: "VIS-20260306-C3D4",
    name: "Tan Mei Ling",
    ic: "920801-10-1234",
    phone: "+60 16-789 0123",
    email: "meiling@contractor.com",
    company: "BrightBuild Contractors",
    purpose: "Contractor",
    host: "Siti Norzahra",
    visitDate: "2026-03-06",
    status: "approved",
    registeredAt: "2026-03-06 09:10",
  },
  {
    id: "VIS-20260305-E5F6",
    name: "Rajesh Kumar",
    ic: "P1234567A",
    phone: "+65 9123 4567",
    email: "rajesh@vendor.sg",
    company: "TechVenture Pte Ltd",
    purpose: "Delivery",
    host: "Jason Lim",
    visitDate: "2026-03-05",
    status: "pending",
    registeredAt: "2026-03-05 14:22",
  },
];

const PURPOSES = ["Meeting", "Delivery", "Interview", "Contractor", "Audit", "Training", "Others"];

// ─── Tiny QR SVG (pixel art pattern — decorative) ────────────────────────────
function QRCodeDisplay({ value }) {
  // Deterministic pixel pattern based on value string
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const size = 21;
  const grid = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      // Always-on finder patterns (corners)
      const inFinder = (
        (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)
      );
      if (inFinder) {
        const fr = r % (size - 7) > 6 ? r - (size - 7) : r;
        const fc = c % (size - 7) > 6 ? c - (size - 7) : c;
        const nr = fr >= size - 7 ? r - (size - 7) : fr;
        const nc = fc >= size - 7 ? c - (size - 7) : fc;
        return (nr === 0 || nr === 6 || nc === 0 || nc === 6 || (nr >= 2 && nr <= 4 && nc >= 2 && nc <= 4));
      }
      return ((seed * (r + 1) * (c + 3) + r * 17 + c * 31) % 3) !== 0;
    })
  );

  return (
    <svg width="160" height="160" viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#111" /> : null
        )
      )}
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    approved: ["badge-green", "Approved"],
    pending:  ["badge-orange", "Pending"],
    rejected: ["badge-red", "Rejected"],
    expired:  ["badge-gray", "Expired"],
  };
  const [cls, label] = map[status] || ["badge-gray", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EVisitor({ setActivePage }) {
  const [visitors, setVisitors] = useState(INITIAL_VISITORS);
  const [view, setView] = useState("list"); // "list" | "form" | "qr"
  const [search, setSearch] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [form, setForm] = useState({
    name: "", ic: "", phone: "", email: "",
    company: "", purpose: "Meeting", host: "", visitDate: "",
  });
  const [errors, setErrors] = useState({});

  const filtered = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.company.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.ic.trim()) e.ic = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.host) e.host = "Required";
    if (!form.visitDate) e.visitDate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const id = `VIS-${form.visitDate.replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const newVisitor = {
      ...form,
      id,
      status: "pending",
      registeredAt: new Date().toLocaleString("en-MY"),
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    setSelectedVisitor(newVisitor);
    setView("qr");
  };

  const resetForm = () => {
    setForm({ name: "", ic: "", phone: "", email: "", company: "", purpose: "Meeting", host: "", visitDate: "" });
    setErrors({});
  };

  const Field = ({ label, id, required, children }) => (
    <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
        {label} {required && <span style={{ color: "var(--danger, #f87171)" }}>*</span>}
      </label>
      {children}
      {errors[id] && <span style={{ fontSize: 11, color: "var(--danger, #f87171)" }}>{errors[id]}</span>}
    </div>
  );

  const inputStyle = (id) => ({
    padding: "9px 12px", borderRadius: 8,
    background: "var(--bg3)", border: `1px solid ${errors[id] ? "var(--danger, #f87171)" : "var(--border)"}`,
    color: "var(--text)", fontFamily: "inherit", fontSize: 13, outline: "none",
    width: "100%", boxSizing: "border-box",
  });

  // ── QR View ──────────────────────────────────────────────────────────────
  if (view === "qr" && selectedVisitor) {
    return (
      <div style={{ padding: "0 32px 32px 24px", maxWidth: "1400px" }}>
        <div className="page-header">
          <div className="flex-between">
            <div>
              <div className="page-title">Visitor Pass Generated ✅</div>
              <div className="page-subtitle">Share the QR code with your visitor for building entry</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setView("list"); resetForm(); }}>
              ← Back to List
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* QR Card */}
          <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Entry Pass
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{selectedVisitor.name}</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>{selectedVisitor.company || "Guest"}</div>

            <div style={{
              display: "inline-block", padding: 16, background: "white",
              borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", marginBottom: 16,
            }}>
              <QRCodeDisplay value={selectedVisitor.id} />
            </div>

            <div style={{
              fontFamily: "monospace", fontSize: 13, fontWeight: 700,
              color: "var(--accent)", letterSpacing: "1px", marginBottom: 20,
            }}>
              {selectedVisitor.id}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left", marginBottom: 20 }}>
              {[
                ["Visit Date", selectedVisitor.visitDate],
                ["Purpose", selectedVisitor.purpose],
                ["Host", selectedVisitor.host],
                ["Status", <StatusBadge status={selectedVisitor.status} />],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}
                onClick={() => window.print()}>
                🖨 Print
              </button>
              <button className="btn btn-primary btn-sm" style={{ flex: 2 }}
                onClick={() => alert(`Pass sent to ${selectedVisitor.email || "visitor's email"}`)}>
                📤 Send via Email
              </button>
            </div>
          </div>

          {/* Info panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-title">Visitor Details</div>
              {[
                ["Full Name", selectedVisitor.name],
                ["IC / Passport", selectedVisitor.ic],
                ["Contact", selectedVisitor.phone],
                ["Email", selectedVisitor.email || "—"],
                ["Company", selectedVisitor.company || "—"],
                ["Registered At", selectedVisitor.registeredAt],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span style={{ color: "var(--text3)" }}>{k}</span>
                  <span style={{ fontWeight: 500, color: "var(--text)" }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Instructions for Visitor</div>
              {[
                "Show this QR code at the lobby kiosk upon arrival.",
                "A valid IC or passport must be presented to the guard.",
                "Pass is valid only on the registered visit date.",
                "Visitor must be accompanied by the host at all times.",
                "Pass expires at end of business day (6:00 PM).",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "var(--text2)" }}>{tip}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }}
              onClick={() => { setView("form"); resetForm(); }}>
              + Register Another Visitor
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form View ─────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div style={{ padding: "0 32px 32px 24px", maxWidth: "1400px" }}>
        <div className="page-header">
          <div className="flex-between">
            <div>
              <div className="page-title">Pre-Register Visitor</div>
              <div className="page-subtitle">Fill in visitor details — they'll receive a QR entry pass</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setView("list"); resetForm(); }}>
              ← Cancel
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div className="card">
            <div className="card-title">Visitor Information</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <Field label="Full Name" id="name" required>
                <input style={inputStyle("name")} value={form.name} placeholder="e.g. Ahmad Rizal bin Hassan"
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="IC / Passport No." id="ic" required>
                  <input style={inputStyle("ic")} value={form.ic} placeholder="e.g. 900101-14-1234"
                    onChange={(e) => setForm({ ...form, ic: e.target.value })} />
                </Field>
                <Field label="Contact Number" id="phone" required>
                  <input style={inputStyle("phone")} value={form.phone} placeholder="+60 12-345 6789"
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Email" id="email">
                  <input style={inputStyle("email")} value={form.email} placeholder="visitor@company.com"
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Company" id="company">
                  <input style={inputStyle("company")} value={form.company} placeholder="Company name"
                    onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Visit Date" id="visitDate" required>
                  <input type="date" style={inputStyle("visitDate")} value={form.visitDate}
                    onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
                </Field>
                <Field label="Purpose of Visit" id="purpose">
                  <select style={{ ...inputStyle("purpose"), cursor: "pointer" }} value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                    {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Looking For (Host)" id="host" required>
                <select style={{ ...inputStyle("host"), cursor: "pointer" }} value={form.host}
                  onChange={(e) => setForm({ ...form, host: e.target.value })}>
                  <option value="">Select employee...</option>
                  {EMPLOYEES.map((e) => (
                    <option key={e.id} value={e.name}>{e.name} — {e.department}</option>
                  ))}
                </select>
              </Field>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setView("list"); resetForm(); }}>
                  Cancel
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit}>
                  Generate QR Pass →
                </button>
              </div>
            </div>
          </div>

          {/* Side hints */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-title">How It Works</div>
              {[
                ["1", "Fill in visitor details", "Name, IC and host are mandatory."],
                ["2", "Generate QR Pass", "A unique pass is created instantly."],
                ["3", "Share with visitor", "Email or print the QR code for them."],
                ["4", "Kiosk check-in", "Visitor scans QR at lobby — no waiting."],
              ].map(([num, title, desc]) => (
                <div key={num} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: "var(--accent)",
                    color: "white", fontWeight: 700, fontSize: 12,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{num}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ background: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.2)" }}>
              <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                ℹ️ Visitors registered here are <strong>pre-approved</strong>. They can proceed directly to the kiosk on arrival without waiting for guard approval.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List View (default) ───────────────────────────────────────────────────
  return (
    <div style={{ padding: "0 32px 32px 24px", maxWidth: "1400px" }}>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">e-Visitor</div>
            <div className="page-subtitle">Register and manage visitor passes for building access</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setView("form")}>
            <UserPlus size={15} style={{ marginRight: 6 }} /> Pre-Register Visitor
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        {[
          { label: "Total Today", value: visitors.filter(v => v.visitDate === new Date().toISOString().split("T")[0]).length, cls: "blue" },
          { label: "Approved", value: visitors.filter(v => v.status === "approved").length, cls: "green" },
          { label: "Pending", value: visitors.filter(v => v.status === "pending").length, cls: "orange" },
          { label: "This Month", value: visitors.filter(v => v.visitDate?.startsWith("2026-03")).length, cls: "purple" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Visitor Log</div>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
            <input
              style={{
                padding: "7px 12px 7px 30px", borderRadius: 8,
                background: "var(--bg3)", border: "1px solid var(--border)",
                color: "var(--text)", fontSize: 13, outline: "none", width: 220,
              }}
              placeholder="Search name, company, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Company</th>
              <th>Purpose</th>
              <th>Host</th>
              <th>Visit Date</th>
              <th>Status</th>
              <th>Pass</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "monospace" }}>{v.id}</div>
                </td>
                <td style={{ color: "var(--text2)", fontSize: 13 }}>{v.company || "—"}</td>
                <td><span className="badge badge-gray">{v.purpose}</span></td>
                <td style={{ fontSize: 13 }}>{v.host}</td>
                <td style={{ fontSize: 13, color: "var(--text2)" }}>{v.visitDate}</td>
                <td><StatusBadge status={v.status} /></td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={() => { setSelectedVisitor(v); setView("qr"); }}
                  >
                    <QrCode size={13} style={{ marginRight: 4 }} /> View
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text3)", padding: 24 }}>No visitors found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
