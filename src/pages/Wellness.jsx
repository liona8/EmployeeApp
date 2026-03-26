import { useState } from "react";
import { Bell, BellOff, CheckCircle, Clock, Users, MapPin, Calendar, Flame, Heart, Award } from "lucide-react";

const PROGRAMS = [
  {
    id: "W001",
    title: "Morning Yoga Flow",
    category: "Yoga",
    emoji: "🧘",
    categoryColor: "#a78bfa",
    instructor: "Ms. Priya Menon",
    location: "Level 3 – Wellness Studio",
    schedule: "Every Monday & Wednesday",
    time: "07:15 – 08:00 AM",
    nextSession: "2026-03-09",
    nextSessionLabel: "Mon, 9 Mar",
    slots: 20,
    enrolled: 14,
    difficulty: "Beginner",
    description: "Start your week centred and calm. This flow focuses on flexibility, breathing and mindfulness — no experience needed.",
    tags: ["Flexibility", "Mindfulness", "Stress Relief"],
    reminder: false,
  },
  {
    id: "W002",
    title: "HIIT Circuit Training",
    category: "Fitness",
    emoji: "🏋️",
    categoryColor: "#f87171",
    instructor: "Mr. Rafi Azlan",
    location: "Level B1 – Gym",
    schedule: "Every Tuesday & Thursday",
    time: "12:15 – 01:00 PM",
    nextSession: "2026-03-10",
    nextSessionLabel: "Tue, 10 Mar",
    slots: 15,
    enrolled: 15,
    difficulty: "Intermediate",
    description: "High-intensity interval training to build strength and endurance. Burn calories and boost energy for the afternoon.",
    tags: ["Strength", "Cardio", "Endurance"],
    reminder: true,
  },
  {
    id: "W003",
    title: "Zumba Dance Fitness",
    category: "Dance",
    emoji: "💃",
    categoryColor: "#fb923c",
    instructor: "Ms. Sarah Lim",
    location: "Level 3 – Multipurpose Hall",
    schedule: "Every Friday",
    time: "05:30 – 06:30 PM",
    nextSession: "2026-03-13",
    nextSessionLabel: "Fri, 13 Mar",
    slots: 30,
    enrolled: 22,
    difficulty: "All Levels",
    description: "Dance your stress away! Zumba combines Latin rhythms with fun cardio movements. Great for mood and cardiovascular health.",
    tags: ["Cardio", "Fun", "Social"],
    reminder: false,
  },
  {
    id: "W004",
    title: "Mental Wellness Workshop",
    category: "Mental Health",
    emoji: "🧠",
    categoryColor: "#34d399",
    instructor: "Dr. Kavitha Raj",
    location: "Level 2 – Training Room B",
    schedule: "Last Friday of each month",
    time: "02:00 – 04:00 PM",
    nextSession: "2026-03-27",
    nextSessionLabel: "Fri, 27 Mar",
    slots: 25,
    enrolled: 18,
    difficulty: "All Levels",
    description: "Interactive workshop covering stress management, work-life balance, and resilience building with a certified counsellor.",
    tags: ["Mindfulness", "Stress Relief", "Well-being"],
    reminder: false,
  },
  {
    id: "W005",
    title: "Pilates Core & Stretch",
    category: "Pilates",
    emoji: "🤸",
    categoryColor: "#5b7cfa",
    instructor: "Ms. Priya Menon",
    location: "Level 3 – Wellness Studio",
    schedule: "Every Thursday",
    time: "07:00 – 07:45 AM",
    nextSession: "2026-03-12",
    nextSessionLabel: "Thu, 12 Mar",
    slots: 16,
    enrolled: 9,
    difficulty: "Beginner",
    description: "Strengthen your core, improve posture and flexibility. Perfect complement to long hours at a desk.",
    tags: ["Core", "Flexibility", "Posture"],
    reminder: false,
  },
  {
    id: "W006",
    title: "Outdoor Walking Club",
    category: "Walking",
    emoji: "🚶",
    categoryColor: "#f59e0b",
    instructor: "Self-guided (HR facilitated)",
    location: "Ground Floor – Meet at Lobby",
    schedule: "Every Wednesday",
    time: "12:30 – 01:15 PM",
    nextSession: "2026-03-11",
    nextSessionLabel: "Wed, 11 Mar",
    slots: 50,
    enrolled: 31,
    difficulty: "All Levels",
    description: "A casual group walk around the building precinct. Fresh air, light exercise, and a chance to connect with colleagues.",
    tags: ["Cardio", "Social", "Outdoor"],
    reminder: true,
  },
];

const CATEGORY_FILTERS = ["All", "Yoga", "Fitness", "Dance", "Pilates", "Mental Health", "Walking"];

const DIFFICULTY_COLOR = {
  "Beginner":     { bg: "rgba(52,211,153,0.12)", color: "#34d399" },
  "Intermediate": { bg: "rgba(251,146,60,0.12)",  color: "#fb923c" },
  "All Levels":   { bg: "rgba(91,124,250,0.12)",  color: "#5b7cfa" },
};

// Simulated enrolled & reminder state
const INITIAL_ENROLLED = ["W002", "W006"];

// Streak / stats data
const WELLNESS_STATS = [
  { label: "Sessions This Month", value: 6, icon: <Flame size={18} />, cls: "orange" },
  { label: "Programs Joined",     value: 2, icon: <Heart size={18} />, cls: "red" },
  { label: "Streak (weeks)",      value: 3, icon: <Award size={18} />, cls: "purple" },
  { label: "Reminders Set",       value: 2, icon: <Bell size={18} />,  cls: "blue" },
];

// Upcoming reminder feed (simulated)
const UPCOMING_REMINDERS = [
  { id: "W002", title: "HIIT Circuit Training",  time: "Tomorrow · 12:15 PM",  emoji: "🏋️" },
  { id: "W006", title: "Outdoor Walking Club",   time: "Wed · 12:30 PM",       emoji: "🚶" },
];

export default function Wellness({ setActivePage }) {
  const [programs, setPrograms]         = useState(PROGRAMS);
  const [enrolled, setEnrolled]         = useState(new Set(INITIAL_ENROLLED));
  const [reminders, setReminders]       = useState(new Set(["W002", "W006"]));
  const [filter, setFilter]             = useState("All");
  const [expandedId, setExpandedId]     = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleEnroll = (id) => {
    setEnrolled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("You've left the program.", "info");
      } else {
        const prog = programs.find(p => p.id === id);
        if (prog && prog.enrolled >= prog.slots) {
          showToast("This session is full. You've been added to the waitlist.", "warn");
          return prev;
        }
        next.add(id);
        showToast(`Enrolled in ${programs.find(p => p.id === id)?.title}! 🎉`);
      }
      return next;
    });
    setPrograms(prev => prev.map(p =>
      p.id === id
        ? { ...p, enrolled: enrolled.has(id) ? p.enrolled - 1 : Math.min(p.enrolled + 1, p.slots) }
        : p
    ));
  };

  const toggleReminder = (id, e) => {
    e.stopPropagation();
    setReminders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Reminder removed.", "info");
      } else {
        next.add(id);
        showToast(`Reminder set! We'll notify you 30 mins before. 🔔`);
      }
      return next;
    });
  };

  const filtered = filter === "All" ? programs : programs.filter(p => p.category === filter);

  const spotsLeft = (p) => p.slots - p.enrolled;
  const spotsColor = (p) => {
    const left = spotsLeft(p);
    if (left === 0) return "#f87171";
    if (left <= 3) return "#fb923c";
    return "#34d399";
  };

  return (
    <div className="wellness-page" style={{ position: "relative", padding: "0 32px 32px 24px", maxWidth: "1400px" }}>

      {/* Toast */}
      {toast && (
        <div className="app-toast" style={{
          background: toast.type === "success" ? "#34d399" : toast.type === "warn" ? "#f59e0b" : "var(--bg2)",
          color: toast.type === "info" ? "var(--text)" : "#0f1117",
          border: toast.type === "info" ? "1px solid var(--border)" : "none",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">Wellness Programs 🌿</div>
            <div className="page-subtitle">Company fitness & well-being sessions — stay active, stay healthy</div>
          </div>
          <div className="flex-gap">
            <button className="btn btn-ghost btn-sm">📅 My Schedule</button>
            <button className="btn btn-primary btn-sm">🔔 {reminders.size} Reminder{reminders.size !== 1 ? "s" : ""} Set</button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stat-grid wellness-stat-grid" style={{ marginBottom: 20 }}>
        {WELLNESS_STATS.map(({ label, value, icon, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div
        className="page-grid-two-col"
        style={{ display: "grid", "--page-grid-cols": "1fr 320px", gap: 24 }}
      >

        {/* Left — program list */}
        <div>
          {/* Category filter tabs */}
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

          {/* Mobile: compact sidebar summary */}
          <div className="chart-mobile-only" style={{ marginBottom: 16 }}>
            <div className="card">
              {/* Upcoming reminders */}
              {UPCOMING_REMINDERS.filter(r => reminders.has(r.id)).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Bell size={12} /> Upcoming Reminders
                  </div>
                  {UPCOMING_REMINDERS.filter(r => reminders.has(r.id)).map(r => (
                    <div key={r.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{r.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{r.title}</span>
                      <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: "auto" }}>🔔 {r.time}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border)", margin: "10px 0 0" }} />
                </div>
              )}

              {/* My enrolled */}
              {enrolled.size > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    My Programs
                  </div>
                  {programs.filter(p => enrolled.has(p.id)).map(p => (
                    <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{p.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{p.title}</span>
                      <span className="wp-card-badge" style={{ marginLeft: "auto", background: `${p.categoryColor}18`, color: p.categoryColor }}>
                        {p.category}
                      </span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border)", margin: "10px 0 0" }} />
                </div>
              )}

              {/* Tips */}
              <div style={{ fontSize: 10, fontWeight: 600, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                💡 Wellness Tips
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  "Drink 8 glasses of water daily",
                  "Stretch every hour",
                  "Sleep 7–8 hours",
                  "Try something new!",
                ].map((tip, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", color: "var(--text2)" }}>
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Program cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((prog) => {
              const isEnrolled  = enrolled.has(prog.id);
              const hasReminder = reminders.has(prog.id);
              const isExpanded  = expandedId === prog.id;
              const isFull      = prog.enrolled >= prog.slots;
              const diff        = DIFFICULTY_COLOR[prog.difficulty] || DIFFICULTY_COLOR["All Levels"];

              return (
                <div
                  key={prog.id}
                  className="wp-card"
                  onClick={() => setExpandedId(isExpanded ? null : prog.id)}
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${isEnrolled ? prog.categoryColor + "55" : "var(--border)"}`,
                    background: isEnrolled ? `${prog.categoryColor}08` : "var(--surface, var(--bg2))",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    overflow: "hidden",
                  }}
                >
                  <div className="wp-card-body">
                    {/* Row 1: avatar + title + actions */}
                    <div className="wp-card-header">
                      <div className="wp-card-avatar" style={{
                        background: `${prog.categoryColor}18`,
                        border: `1px solid ${prog.categoryColor}30`,
                      }}>
                        {prog.emoji}
                      </div>

                      <div className="wp-card-title-group">
                        <span className="wp-card-title">{prog.title}</span>
                      </div>

                      <div className="wp-card-actions" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleReminder(prog.id, { stopPropagation: () => {} })}
                          className="btn btn-ghost btn-sm"
                          style={{
                            fontSize: 11, padding: "5px 10px",
                            color: hasReminder ? "#f59e0b" : "var(--text3)",
                            borderColor: hasReminder ? "rgba(245,158,11,0.4)" : "var(--border)",
                            background: hasReminder ? "rgba(245,158,11,0.08)" : undefined,
                          }}
                          title={hasReminder ? "Remove reminder" : "Set reminder"}
                        >
                          {hasReminder ? <Bell size={13} /> : <BellOff size={13} />}
                          <span style={{ marginLeft: 4 }}>{hasReminder ? "On" : "Off"}</span>
                        </button>
                        <button
                          onClick={() => toggleEnroll(prog.id)}
                          className={isEnrolled ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"}
                          style={{ fontSize: 11, padding: "5px 10px", whiteSpace: "nowrap" }}
                        >
                          {isEnrolled ? "Leave" : isFull ? "Waitlist" : "Join"}
                        </button>
                      </div>
                    </div>

                    {/* Row 2: badges */}
                    <div className="wp-card-badges">
                      <span className="wp-card-badge" style={{ background: `${prog.categoryColor}18`, color: prog.categoryColor, border: `1px solid ${prog.categoryColor}30` }}>
                        {prog.category}
                      </span>
                      <span className="wp-card-badge" style={{ background: diff.bg, color: diff.color }}>
                        {prog.difficulty}
                      </span>
                      {isEnrolled && (
                        <span className="wp-card-badge" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                          ✓ Enrolled
                        </span>
                      )}
                    </div>

                    {/* Row 3: meta */}
                    <div className="wp-card-meta">
                      <span><Clock size={12} /> {prog.time}</span>
                      <span><Calendar size={12} /> {prog.schedule}</span>
                      <span><MapPin size={12} /> {prog.location}</span>
                    </div>

                    {/* Row 4: next session + spots */}
                    <div className="wp-card-footer">
                      <span style={{ fontWeight: 600, color: "var(--accent)" }}>
                        Next: {prog.nextSessionLabel}
                      </span>
                      <span style={{ fontWeight: 600, color: spotsColor(prog) }}>
                        {isFull ? "● Full" : `● ${spotsLeft(prog)} spot${spotsLeft(prog) !== 1 ? "s" : ""} left`}
                      </span>
                      <span style={{ color: "var(--text3)" }}>
                        <Users size={11} style={{ marginRight: 3, verticalAlign: "middle" }} />
                        {prog.enrolled}/{prog.slots}
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)", paddingTop: 14 }}
                      onClick={e => e.stopPropagation()}>
                      <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>
                        {prog.description}
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        {prog.tags.map(tag => (
                          <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text3)" }}>
                        <span>👩‍🏫 <strong style={{ color: "var(--text2)" }}>{prog.instructor}</strong></span>
                      </div>

                      {/* Capacity bar */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginBottom: 5 }}>
                          <span>Capacity</span>
                          <span>{prog.enrolled} / {prog.slots} enrolled</span>
                        </div>
                        <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            width: `${(prog.enrolled / prog.slots) * 100}%`, height: "100%",
                            background: isFull ? "#f87171" : prog.enrolled / prog.slots > 0.75 ? "#fb923c" : "#34d399",
                            borderRadius: 3, transition: "width 0.4s",
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

        {/* Right sidebar — hidden on mobile */}
        <div className="chart-desktop-sidebar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Upcoming reminders */}
          <div className="card">
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={15} /> Upcoming Reminders
            </div>
            {UPCOMING_REMINDERS.filter(r => reminders.has(r.id)).length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text3)", padding: "8px 0" }}>
                No reminders set. Toggle 🔔 on any program.
              </div>
            ) : (
              UPCOMING_REMINDERS.filter(r => reminders.has(r.id)).map(r => (
                <div key={r.id} style={{
                  display: "flex", gap: 12, alignItems: "center",
                  padding: "10px 12px", borderRadius: 8, marginBottom: 8,
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                }}>
                  <span style={{ fontSize: 22 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>🔔 {r.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* My enrolled programs */}
          <div className="card">
            <div className="card-title">My Programs</div>
            {enrolled.size === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text3)", padding: "8px 0" }}>
                You haven't joined any programs yet.
              </div>
            ) : (
              programs.filter(p => enrolled.has(p.id)).map(p => (
                <div key={p.id} style={{
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "8px 0", borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{p.nextSessionLabel} · {p.time.split("–")[0].trim()}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: `${p.categoryColor}18`, color: p.categoryColor }}>
                    {p.category}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Tips card */}
          <div className="card" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <div className="card-title" style={{ color: "#34d399" }}>💡 Wellness Tips</div>
            {[
              "Drink 8 glasses of water daily.",
              "Take a 5-min stretch break every hour.",
              "Aim for 7–8 hours of sleep.",
              "Try one new program this month!",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text2)", marginBottom: 8, lineHeight: 1.5 }}>
                <span style={{ color: "#34d399", fontWeight: 700, flexShrink: 0 }}>→</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}