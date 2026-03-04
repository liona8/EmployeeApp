import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboard";
import api from "../services/api";
import "./all.css";

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
  const userId = "EMP001";
  const [employee, setEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        // 1️⃣ Employee Info
        const userRes = await api.get(`/users/${userId}`);
        setEmployee(userRes?.data || null);

        // 2️⃣ Leave Balance
        const leaveRes = await dashboardService.getLeaveBalance(userId);
        setLeaveBalance(leaveRes || null);

        // 3️⃣ Leave History — only show future/ongoing leaves
        const historyResRaw = await dashboardService.getLeaveHistory(userId);
        const historyRes = Array.isArray(historyResRaw) ? historyResRaw : [];
        const today = new Date().toISOString().split("T")[0];
        const futureLeaves = historyRes.filter((l) => l.end_date >= today);
        setRecentLeaves(futureLeaves.slice(0, 3));

        // 4️⃣ Upcoming Bookings — only show future bookings
        const bookingRes = await dashboardService.getBookingDetails(
          null,
          userId,
          today,
          null
        );
        const bookingsArray = Array.isArray(bookingRes)
          ? bookingRes
          : bookingRes?.bookings || [];
        const futureBookings = bookingsArray.filter((b) => b.date >= today);
        setUpcomingBookings(futureBookings.slice(0, 3));

        // 5️⃣ Tickets
        const ticketsRaw = await dashboardService.listEmployeeTickets(userId);
        const tickets = Array.isArray(ticketsRaw) ? ticketsRaw : [];

        // 6️⃣ Build Activity Feed
        const combinedActivity = [
          ...futureLeaves.map((l) => ({
            id: `leave-${l.id}`,
            text: `Leave ${l.id} ${l.status}`,
            time: l.start_date,
            color: "#5b7cfa",
          })),
          ...futureBookings.map((b) => ({
            id: `booking-${b.booking_id}`,
            text: `Room ${b.room_name} booked`,
            time: b.date,
            color: "#34d399",
          })),
          ...tickets.map((t) => ({
            id: `ticket-${t.id}`,
            text: `Ticket ${t.id} - ${t.status}`,
            time: t.created_at,
            color: "#fb923c",
          })),
        ];

        combinedActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
        setActivity(combinedActivity.slice(0, 5));
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

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
            <div className="page-title">Good morning, {employee?.name?.split(" ")[0]} 👋</div>
            <div className="page-subtitle">{employee?.job_title} · {employee?.department}</div>
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
          <div className="stat-value">{leaveBalance?.annual_leave?.remaining}</div>
          <div className="stat-sub">days remaining of {leaveBalance?.annual_leave?.total_entitlement}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🏥</div>
          <div className="stat-label">Medical Leave</div>
          <div className="stat-value">{leaveBalance?.medical_leave?.remaining}</div>
          <div className="stat-sub">days remaining of {leaveBalance?.medical_leave?.total_entitlement}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">↩</div>
          <div className="stat-label">Carry Forward</div>
          <div className="stat-value">{leaveBalance?.annual_leave?.carry_forward_from_previous}</div>
          <div className="stat-sub">days from 2025 · expires Jun 30</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⭐</div>
          <div className="stat-label">Years of Service</div>
          <div className="stat-value">{employee?.years_of_service}</div>
          <div className="stat-sub">Grade {employee?.job_grade} · {employee?.employment_status}</div>
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
                {recentLeaves.length > 0 ? recentLeaves.map((l) => (
                  <tr key={l.id}>
                    <td><span style={{ color: "var(--text)", fontWeight: 500 }}>{l.leave_type}</span></td>
                    <td>{l.start_date} → {l.end_date}</td>
                    <td>{l.duration_days}d</td>
                    <td>{statusBadge(l.status)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text3)" }}>No recent leaves</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Upcoming Bookings */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Upcoming Room Bookings</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActivePage("calendar")}>View Calendar</button>
            </div>
            {upcomingBookings.length > 0 ? upcomingBookings.map((b) => (
              <div key={b.booking_id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px", marginBottom: 8,
                background: "var(--bg3)", borderRadius: 8,
                border: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 13 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{b.room_name} · {b.start_time} – {b.end_time}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", textAlign: "right" }}>
                  <div style={{ color: "var(--accent)", fontWeight: 500 }}>{b.date}</div>
                  <div style={{ marginTop: 2 }}>{b.booking_id}</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", color: "var(--text3)", padding: "16px 0" }}>No upcoming bookings</div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Leave Balance Overview */}
          <div className="card">
            <div className="card-title">Leave Balance Overview</div>
            {leaveTypes.map(({ key, label, colorClass }) => {
              const data = leaveBalance?.[key] || { total_entitlement: 3, used: 0, remaining: 3 };
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
            <button
              className="btn btn-ghost btn-sm mt-16"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setActivePage("leave")}
            >
              Apply for Leave →
            </button>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="card-title">Recent Activity</div>
            {activity.length > 0 ? activity.map((a, i) => (
              <div className="activity-item" key={a.id || i}>
                <div className="activity-dot" style={{ background: a.color }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", color: "var(--text3)", padding: "16px 0" }}>No recent activity</div>
            )}
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
                <button
                  key={a.page}
                  className="btn btn-ghost"
                  style={{ justifyContent: "flex-start" }}
                  onClick={() => setActivePage(a.page)}
                >
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