import { useState } from "react";
import { BookOpen, Calendar, Clock, Users, Award, ChevronRight, CheckCircle, Play, Star, TrendingUp } from "lucide-react";

// ─── Hardcoded data ───────────────────────────────────────────────────────────
const LEARNING_PROGRAMS = [
  {
    id: "LP001",
    title: "Leadership Essentials",
    category: "Leadership",
    categoryColor: "#f59e0b",
    emoji: "👑",
    provider: "CHART Internal",
    duration: "3 days",
    format: "Classroom",
    level: "Intermediate",
    nextRun: "2026-03-18",
    nextRunLabel: "18–20 Mar 2026",
    seats: 20,
    enrolled: 12,
    description: "Build foundational leadership skills: communication, decision-making, and team motivation for aspiring managers.",
    modules: ["Leading with Influence", "Effective Communication", "Decision Making Under Pressure", "Coaching & Feedback"],
    tags: ["Leadership", "Management", "Communication"],
    status: "open",
    registered: false,
  },
  {
    id: "LP002",
    title: "Excel & Data Analytics for HR",
    category: "Digital Skills",
    categoryColor: "#5b7cfa",
    emoji: "📊",
    provider: "CHART x Microsoft",
    duration: "1 day",
    format: "Classroom",
    level: "Beginner",
    nextRun: "2026-03-12",
    nextRunLabel: "12 Mar 2026",
    seats: 25,
    enrolled: 25,
    description: "Master Excel pivot tables, VLOOKUP, dashboards and basic data analysis. Targeted at non-technical staff.",
    modules: ["Excel Fundamentals Refresh", "Pivot Tables & Charts", "VLOOKUP & XLOOKUP", "Building Dashboards"],
    tags: ["Excel", "Data", "Analytics"],
    status: "full",
    registered: false,
  },
  {
    id: "LP003",
    title: "Workplace Safety & Health (WSH) Refresher",
    category: "Compliance",
    categoryColor: "#f87171",
    emoji: "🦺",
    provider: "CHART Internal",
    duration: "Half day",
    format: "Classroom",
    level: "All Levels",
    nextRun: "2026-03-25",
    nextRunLabel: "25 Mar 2026",
    seats: 40,
    enrolled: 17,
    description: "Mandatory annual WSH refresher covering hazard identification, emergency procedures and legal obligations.",
    modules: ["WSH Legislation Overview", "Hazard Identification", "Emergency Response", "Incident Reporting"],
    tags: ["Safety", "Compliance", "Mandatory"],
    status: "open",
    registered: true,
  },
  {
    id: "LP004",
    title: "Customer Service Excellence",
    category: "Soft Skills",
    categoryColor: "#34d399",
    emoji: "🤝",
    provider: "CHART Internal",
    duration: "2 days",
    format: "Classroom",
    level: "All Levels",
    nextRun: "2026-04-08",
    nextRunLabel: "8–9 Apr 2026",
    seats: 20,
    enrolled: 6,
    description: "Develop skills to handle customer interactions professionally — complaint management, empathy, and service recovery.",
    modules: ["Customer Psychology", "Active Listening", "Handling Difficult Customers", "Service Recovery Techniques"],
    tags: ["Customer Service", "Communication", "Soft Skills"],
    status: "open",
    registered: false,
  },
  {
    id: "LP005",
    title: "Project Management Fundamentals",
    category: "Project Management",
    categoryColor: "#a78bfa",
    emoji: "📋",
    provider: "CHART x PMI",
    duration: "2 days",
    format: "Hybrid",
    level: "Intermediate",
    nextRun: "2026-04-14",
    nextRunLabel: "14–15 Apr 2026",
    seats: 18,
    enrolled: 10,
    description: "Learn PM fundamentals: scope, schedule, risk, and stakeholder management aligned to PMI standards.",
    modules: ["Project Lifecycle", "Scope & Schedule", "Risk Management", "Stakeholder Communication"],
    tags: ["Project Management", "Planning", "PMI"],
    status: "open",
    registered: false,
  },
  {
    id: "LP006",
    title: "Emotional Intelligence at Work",
    category: "Soft Skills",
    categoryColor: "#fb923c",
    emoji: "💛",
    provider: "CHART Internal",
    duration: "1 day",
    format: "Classroom",
    level: "All Levels",
    nextRun: "2026-03-19",
    nextRunLabel: "19 Mar 2026",
    seats: 20,
    enrolled: 14,
    description: "Understand and apply emotional intelligence to improve workplace relationships, conflict resolution and leadership.",
    modules: ["Understanding EQ", "Self-Awareness & Regulation", "Empathy in Practice", "Managing Conflict"],
    tags: ["EQ", "Leadership", "Soft Skills"],
    status: "open",
    registered: false,
  },
];

const MY_UPCOMING_TRAININGS = [
  {
    id: "TR001",
    title: "WSH Refresher",
    date: "25 Mar 2026",
    time: "09:00 AM – 01:00 PM",
    location: "Level 2 – Training Room B",
    status: "confirmed",
    emoji: "🦺",
    programId: "LP003",
  },
];

const MY_COMPLETED = [
  { id: "C001", title: "Onboarding Programme",        completedDate: "2024-04-15", hours: 16, emoji: "🎓", cert: true },
  { id: "C002", title: "Data Privacy Awareness",       completedDate: "2025-01-10", hours: 4,  emoji: "🔒", cert: true },
  { id: "C003", title: "Fire Safety Warden Training",  completedDate: "2025-06-22", hours: 8,  emoji: "🚒", cert: true },
  { id: "C004", title: "Effective Presentation Skills",completedDate: "2025-09-05", hours: 8,  emoji: "🎤", cert: false },
];

const CATEGORY_FILTERS = ["All", "Leadership", "Digital Skills", "Compliance", "Soft Skills", "Project Management"];

const LEVEL_COLOR = {
  "Beginner":     { bg: "rgba(52,211,153,0.12)",  color: "#34d399" },
  "Intermediate": { bg: "rgba(251,146,60,0.12)",   color: "#fb923c" },
  "All Levels":   { bg: "rgba(91,124,250,0.12)",   color: "#5b7cfa" },
};

const FORMAT_ICON = { Classroom: "🏫", Hybrid: "💻", "E-Learning": "📱" };

const LEARNING_STATS = [
  { label: "Training Hours (YTD)", value: "36h",  icon: <Clock size={18} />,      cls: "blue" },
  { label: "Programs Completed",   value: 4,      icon: <CheckCircle size={18} />, cls: "green" },
  { label: "Certificates Earned",  value: 3,      icon: <Award size={18} />,       cls: "purple" },
  { label: "Upcoming Trainings",   value: MY_UPCOMING_TRAININGS.length, icon: <Calendar size={18} />, cls: "orange" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Chart({ setActivePage }) {
  const [tab, setTab]               = useState("calendar");   // "calendar" | "my" | "history"
  const [filter, setFilter]         = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [programs, setPrograms]     = useState(LEARNING_PROGRAMS);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const toggleRegister = (id) => {
    setPrograms(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.registered) {
        showToast(`Withdrawn from "${p.title}".`, "info");
        return { ...p, registered: false, enrolled: p.enrolled - 1 };
      }
      if (p.enrolled >= p.seats) {
        showToast("This program is full. You've been added to the waitlist.", "warn");
        return p;
      }
      showToast(`Registered for "${p.title}"! Check My Trainings. 🎉`);
      return { ...p, registered: true, enrolled: p.enrolled + 1 };
    }));
  };

  const filtered = filter === "All" ? programs : programs.filter(p => p.category === filter);

  const statusStyle = (status) => {
    if (status === "confirmed") return { bg: "rgba(52,211,153,0.12)", color: "#34d399", label: "Confirmed" };
    if (status === "pending")   return { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", label: "Pending" };
    return                             { bg: "var(--bg3)",             color: "var(--text3)", label: status };
  };

  return (
    <div style={{ position: "relative", padding: "0 32px 32px 24px", maxWidth: "1400px" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: toast.type === "success" ? "#34d399" : toast.type === "warn" ? "#f59e0b" : "var(--bg2)",
          color: toast.type === "info" ? "var(--text)" : "#0f1117",
          border: toast.type === "info" ? "1px solid var(--border)" : "none",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
          animation: "slideUp 0.25s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontWeight: 900, letterSpacing: "-1px",
                background: "linear-gradient(135deg, #5b7cfa, #a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>CHART</span>
              <span style={{ fontWeight: 400, fontSize: 16, color: "var(--text2)", WebkitTextFillColor: "unset" }}>
                — Learning & Development
              </span>
            </div>
            <div className="page-subtitle">Chin Hin Academy for Reskilling &amp; Transformation</div>
          </div>
          <div className="flex-gap">
            <button className="btn btn-ghost btn-sm">📜 My Certificates</button>
            <button className="btn btn-primary btn-sm">+ Nominate Training</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {LEARNING_STATS.map(({ label, value, icon, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { key: "calendar", label: "📅 Learning Calendar" },
          { key: "my",       label: "📌 My Upcoming Trainings" },
          { key: "history",  label: "🏅 My Learning" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={tab === key ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
            style={{ fontSize: 13 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: Learning Calendar ── */}
      {tab === "calendar" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            {/* Category filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={filter === cat ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                  style={{ fontSize: 12 }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Program cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((prog) => {
                const isExpanded  = expandedId === prog.id;
                const isFull      = prog.status === "full" || prog.enrolled >= prog.seats;
                const lv          = LEVEL_COLOR[prog.level] || LEVEL_COLOR["All Levels"];
                const spotsLeft   = prog.seats - prog.enrolled;

                return (
                  <div
                    key={prog.id}
                    onClick={() => setExpandedId(isExpanded ? null : prog.id)}
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${prog.registered ? prog.categoryColor + "55" : "var(--border)"}`,
                      background: prog.registered ? `${prog.categoryColor}06` : "var(--surface, var(--bg2))",
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {/* Icon */}
                      <div style={{
                        width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                        background: `${prog.categoryColor}18`, border: `1px solid ${prog.categoryColor}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                      }}>
                        {prog.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title + badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{prog.title}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${prog.categoryColor}18`, color: prog.categoryColor, border: `1px solid ${prog.categoryColor}30` }}>
                            {prog.category}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: lv.bg, color: lv.color }}>
                            {prog.level}
                          </span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text3)" }}>
                            {FORMAT_ICON[prog.format]} {prog.format}
                          </span>
                          {prog.registered && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                              ✓ Registered
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={12} /> {prog.nextRunLabel}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> {prog.duration}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                            <BookOpen size={12} /> {prog.provider}
                          </span>
                        </div>

                        {/* Spots */}
                        <div style={{ display: "flex", gap: 12, marginTop: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: isFull ? "#f87171" : spotsLeft <= 4 ? "#fb923c" : "#34d399" }}>
                            {isFull ? "● Full" : `● ${spotsLeft} seat${spotsLeft !== 1 ? "s" : ""} left`}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text3)" }}>
                            <Users size={11} style={{ marginRight: 3, verticalAlign: "middle" }} />{prog.enrolled}/{prog.seats}
                          </span>
                        </div>
                      </div>

                      {/* Register button */}
                      <div onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleRegister(prog.id)}
                          className={prog.registered ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
                          style={{
                            fontSize: 11, padding: "6px 14px", whiteSpace: "nowrap",
                            ...(prog.registered ? { borderColor: "rgba(52,211,153,0.4)", color: "#34d399" } : {}),
                          }}
                          disabled={isFull && !prog.registered}
                        >
                          {prog.registered ? "✓ Withdraw" : isFull ? "Waitlist" : "Register"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)", paddingTop: 14 }}
                        onClick={e => e.stopPropagation()}>
                        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, marginBottom: 12 }}>
                          {prog.description}
                        </p>

                        {/* Modules */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                            Programme Modules
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {prog.modules.map((mod, i) => (
                              <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text2)", alignItems: "flex-start" }}>
                                <span style={{ color: prog.categoryColor, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                                <span>{mod}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tags */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {prog.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}>
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Capacity bar */}
                        <div style={{ marginTop: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginBottom: 5 }}>
                            <span>Enrolment</span>
                            <span>{prog.enrolled} / {prog.seats}</span>
                          </div>
                          <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              width: `${(prog.enrolled / prog.seats) * 100}%`, height: "100%", borderRadius: 3,
                              background: isFull ? "#f87171" : prog.enrolled / prog.seats > 0.75 ? "#fb923c" : "#34d399",
                              transition: "width 0.4s",
                            }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* About CHART */}
            <div className="card" style={{ background: "linear-gradient(135deg, rgba(91,124,250,0.08), rgba(167,139,250,0.08))", border: "1px solid rgba(91,124,250,0.2)" }}>
              <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-1px", marginBottom: 4, background: "linear-gradient(135deg,#5b7cfa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                CHART
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10 }}>Chin Hin Academy for Reskilling &amp; Transformation</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                CHART offers structured learning programs to help employees grow professionally — from technical skills to leadership development.
              </div>
            </div>

            {/* My registered coming up */}
            <div className="card">
              <div className="card-title">Registered Programs</div>
              {programs.filter(p => p.registered).length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text3)" }}>No registrations yet.</div>
              ) : (
                programs.filter(p => p.registered).map(p => (
                  <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 18 }}>{p.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{p.nextRunLabel}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Learning path nudge */}
            <div className="card" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="card-title" style={{ color: "#f59e0b" }}>🎯 Recommended for You</div>
              {["Leadership Essentials", "Emotional Intelligence at Work"].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text2)", marginBottom: 8, alignItems: "center" }}>
                  <ChevronRight size={13} style={{ color: "#f59e0b", flexShrink: 0 }} />{t}
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                Based on your role: Software Engineer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: My Upcoming Trainings ── */}
      {tab === "my" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            {programs.filter(p => p.registered).length === 0 && MY_UPCOMING_TRAININGS.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>No upcoming trainings</div>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 6, marginBottom: 20 }}>
                  Register for programs in the Learning Calendar.
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setTab("calendar")}>Browse Programs →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* System-registered (LP003 hardcoded) */}
                {MY_UPCOMING_TRAININGS.map((t) => {
                  const st = statusStyle(t.status);
                  return (
                    <div key={t.id} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(247,111,111,0.12)", border: "1px solid rgba(247,111,111,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {t.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </div>
                        {[
                          { icon: "📅", val: t.date },
                          { icon: "🕐", val: t.time },
                          { icon: "📍", val: t.location },
                        ].map(({ icon, val }) => (
                          <div key={val} style={{ fontSize: 12, color: "var(--text3)", marginBottom: 3, display: "flex", gap: 6 }}>
                            <span>{icon}</span><span>{val}</span>
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                        Add to Calendar
                      </button>
                    </div>
                  );
                })}

                {/* User-registered via the calendar tab */}
                {programs.filter(p => p.registered && p.id !== "LP003").map((p) => (
                  <div key={p.id} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: `${p.categoryColor}18`, border: `1px solid ${p.categoryColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {p.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{p.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                          Confirmed
                        </span>
                      </div>
                      {[
                        { icon: "📅", val: p.nextRunLabel },
                        { icon: "⏱", val: p.duration },
                        { icon: "🏫", val: `${p.format} — ${p.provider}` },
                      ].map(({ icon, val }) => (
                        <div key={val} style={{ fontSize: 12, color: "var(--text3)", marginBottom: 3, display: "flex", gap: 6 }}>
                          <span>{icon}</span><span>{val}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
                      onClick={() => toggleRegister(p.id)}
                    >
                      Withdraw
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar hints */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-title">📋 Before You Attend</div>
              {[
                "Bring your Staff ID card.",
                "Arrive 10 minutes early.",
                "Notify your manager if you need to cancel.",
                "Post-training feedback form will be emailed.",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text2)", marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: My Learning (history) ── */}
      {tab === "history" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            {/* Progress summary */}
            <div className="card" style={{ marginBottom: 16, background: "linear-gradient(135deg, rgba(91,124,250,0.06), rgba(167,139,250,0.06))", border: "1px solid rgba(91,124,250,0.18)" }}>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { label: "Total Training Hours", value: "36h", icon: "⏱" },
                  { label: "Programmes Completed", value: MY_COMPLETED.length, icon: "✅" },
                  { label: "Certificates", value: MY_COMPLETED.filter(c => c.cert).length, icon: "🏅" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 2 }}>{icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: "var(--text)" }}>{value}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Completed Programmes</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Programme</th>
                    <th>Completed</th>
                    <th>Hours</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {MY_COMPLETED.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span style={{ fontSize: 18 }}>{c.emoji}</span>
                          <span style={{ fontWeight: 500, color: "var(--text)" }}>{c.title}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text3)", fontSize: 13 }}>{c.completedDate}</td>
                      <td style={{ fontSize: 13 }}>{c.hours}h</td>
                      <td>
                        {c.cert
                          ? <span className="badge badge-green">🏅 Issued</span>
                          : <span className="badge badge-gray">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <div className="card-title" style={{ color: "#34d399" }}>🎯 Learning Goals 2026</div>
              {[
                { label: "Complete 40h training", done: 36, total: 40 },
                { label: "Earn 1 leadership cert", done: 0, total: 1 },
              ].map(({ label, done, total }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: "var(--text2)" }}>{label}</span>
                    <span style={{ color: "var(--text3)" }}>{done}/{total}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (done / total) * 100)}%`, height: "100%", background: "#34d399", borderRadius: 3, transition: "width 0.4s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}