import { useState } from "react";
import "./all.css";

const mockEmployee = {
  id: "EMP001",
  name: "Ahmad Razif",
  department: "Engineering",
  job_title: "Senior Engineer",
  job_grade: 16,
  years_of_service: 4.5,
  employment_status: "permanent",
};

const mockLeave = {
  annual_leave: { total_entitlement: 18, used: 5, remaining: 13, carry_forward_from_previous: 3 },
  medical_leave: { total_entitlement: 14, used: 2, remaining: 12 },
  compassionate_leave: { used: 0, remaining: 3 },
};

const recentLeaves = [
  { id: "LA-2026-A1B2C", type: "Annual Leave", start: "2026-01-15", end: "2026-01-17", days: 3, status: "approved" },
  { id: "LA-2026-D3E4F", type: "Medical Leave", start: "2026-02-10", end: "2026-02-10", days: 1, status: "approved" },
  { id: "LA-2026-G5H6I", type: "Annual Leave", start: "2026-03-25", end: "2026-03-28", days: 4, status: "pending_approval" },
];

const upcomingBookings = [
  { id: "BKG-20260228-001", room: "Boardroom A", date: "2026-02-28", time: "10:00 AM – 11:00 AM", title: "Q1 Sprint Planning" },
  { id: "BKG-20260303-002", room: "Meeting Room 3B", date: "2026-03-03", time: "2:00 PM – 3:30 PM", title: "Design Review" },
];

const activity = [
  { text: "Leave application LA-2026-G5H6I submitted for review", time: "2 hours ago", color: "#5b7cfa" },
  { text: "Room BKG-20260228-001 booked for Q1 Sprint Planning", time: "Yesterday", color: "#34d399" },
  { text: "Service ticket MT-2026-08AB created for AC issue", time: "3 days ago", color: "#fb923c" },
  { text: "Medical leave approved by HR", time: "Feb 12", color: "#a78bfa" },
];

const statusBadge = (status) => {
  const map = {
    approved: ["badge-green", "Approved"],
    pending_approval: ["badge-orange", "Pending"],
    rejected: ["badge-red", "Rejected"],
  };
  const [cls, label] = map[status] || ["badge-gray", status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

export default function Dashboard({ setActivePage }) {
  const leaveTypes = [
    { key: "annual_leave", label: "Annual Leave", colorClass: "fill-blue" },
    { key: "medical_leave", label: "Medical Leave", colorClass: "fill-green" },
    { key: "compassionate_leave", label: "Compassionate", colorClass: "fill-purple" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">Good morning, {mockEmployee.name.split(" ")[0]} 👋</div>
            <div className="page-subtitle">{mockEmployee.job_title} · {mockEmployee.department}</div>
          </div>
          <div className="flex-gap">
            <button className="btn btn-ghost btn-sm" onClick={() => setActivePage("leave")}>Apply Leave</button>
            <button className="btn btn-primary btn-sm" onClick={() => setActivePage("chat")}>AI Assistant</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Annual Leave</div>
          <div className="stat-value">{mockLeave.annual_leave.remaining}</div>
          <div className="stat-sub">days remaining of {mockLeave.annual_leave.total_entitlement}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🏥</div>
          <div className="stat-label">Medical Leave</div>
          <div className="stat-value">{mockLeave.medical_leave.remaining}</div>
          <div className="stat-sub">days remaining of {mockLeave.medical_leave.total_entitlement}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">↩</div>
          <div className="stat-label">Carry Forward</div>
          <div className="stat-value">{mockLeave.annual_leave.carry_forward_from_previous}</div>
          <div className="stat-sub">days from 2025 · expires Jun 30</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⭐</div>
          <div className="stat-label">Years of Service</div>
          <div className="stat-value">{mockEmployee.years_of_service}</div>
          <div className="stat-sub">Grade {mockEmployee.job_grade} · {mockEmployee.employment_status}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Recent Leaves */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Recent Leave Applications</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActivePage("leave")}>View All</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((l) => (
                  <tr key={l.id}>
                    <td><span style={{ color: "var(--text)", fontWeight: 500 }}>{l.type}</span></td>
                    <td>{l.start} → {l.end}</td>
                    <td>{l.days}d</td>
                    <td>{statusBadge(l.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upcoming Bookings */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Upcoming Room Bookings</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActivePage("calendar")}>View Calendar</button>
            </div>
            {upcomingBookings.map((b) => (
              <div key={b.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px", marginBottom: 8,
                background: "var(--bg3)", borderRadius: 8,
                border: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 13 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{b.room} · {b.time}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", textAlign: "right" }}>
                  <div style={{ color: "var(--accent)", fontWeight: 500 }}>{b.date}</div>
                  <div style={{ marginTop: 2 }}>{b.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Leave Balance Overview */}
          <div className="card">
            <div className="card-title">Leave Balance Overview</div>
            {leaveTypes.map(({ key, label, colorClass }) => {
              const data = mockLeave[key] || { total_entitlement: 3, used: 0, remaining: 3 };
              const total = data.total_entitlement || 3;
              const pct = Math.round(((data.used || 0) / total) * 100);
              return (
                <div className="progress-bar-wrap" key={key}>
                  <div className="progress-header">
                    <span className="progress-name">{label}</span>
                    <span className="progress-count">{data.remaining ?? data.total_entitlement} / {total} left</span>
                  </div>
                  <div className="progress-track">
                    <div className={`progress-fill ${colorClass}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <button className="btn btn-ghost btn-sm mt-16" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setActivePage("leave")}>
              Apply for Leave →
            </button>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="card-title">Recent Activity</div>
            {activity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.color }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "🗓  Apply for Leave", page: "leave" },
                { label: "🏢  Book a Meeting Room", page: "calendar" },
                { label: "🤖  Ask AI Assistant", page: "chat" },
              ].map((a) => (
                <button key={a.page} className="btn btn-ghost" style={{ justifyContent: "flex-start" }}
                  onClick={() => setActivePage(a.page)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}