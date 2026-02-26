import { useState } from "react";
import "./all.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Mock events
const events = {
  "2026-02-26": [{ type: "leave", label: "Annual Leave", color: "#a78bfa" }],
  "2026-02-28": [{ type: "booking", label: "Q1 Sprint Planning – Boardroom A", color: "#5b7cfa" }],
  "2026-03-03": [{ type: "booking", label: "Design Review – Room 3B", color: "#5b7cfa" }],
  "2026-03-10": [{ type: "leave", label: "Medical Leave", color: "#34d399" }],
  "2026-03-25": [{ type: "leave", label: "Annual Leave", color: "#a78bfa" }],
  "2026-03-26": [{ type: "leave", label: "Annual Leave", color: "#a78bfa" }],
  "2026-03-27": [{ type: "leave", label: "Annual Leave", color: "#a78bfa" }],
  "2026-03-28": [{ type: "leave", label: "Annual Leave", color: "#a78bfa" }],
  "2026-03-31": [{ type: "holiday", label: "Hari Raya Aidilfitri", color: "#fb923c" }],
  "2026-04-01": [{ type: "holiday", label: "Hari Raya Aidilfitri", color: "#fb923c" }],
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

const today = new Date();

function formatKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(1); // Feb
  const [selectedDay, setSelectedDay] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [booking, setBooking] = useState({ room: "", title: "", time: "", duration: "60" });

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);
  const prevDays = getDaysInMonth(currentYear, currentMonth - 1);

  const cells = [];
  // Prev month tail
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false });
  }
  // Current month
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, current: true });
  }
  // Next month head
  while (cells.length < 42) {
    cells.push({ day: cells.length - totalDays - firstDay + 1, current: false });
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const isToday = (d) =>
    d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const getDayEvents = (d, current) => {
    if (!current) return [];
    return events[formatKey(currentYear, currentMonth, d)] || [];
  };

  const selectedKey = selectedDay ? formatKey(currentYear, currentMonth, selectedDay) : null;
  const selectedEvents = selectedKey ? (events[selectedKey] || []) : [];

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">Calendar</div>
            <div className="page-subtitle">Leave schedule & room bookings</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowBookingModal(true)}>
            + Book Room
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, padding: "0 32px 32px" }}>

        {/* Calendar */}
        <div className="card">
          {/* Month Nav */}
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹</button>
            <span className="font-syne" style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={nextMonth}>›</button>
          </div>

          {/* Day Names */}
          <div className="calendar-grid" style={{ marginBottom: 4 }}>
            {DAYS.map(d => (
              <div className="cal-day-name" key={d}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="calendar-grid">
            {cells.map((cell, i) => {
              const evts = getDayEvents(cell.day, cell.current);
              const hasHoliday = evts.some(e => e.type === "holiday");
              const hasLeave = evts.some(e => e.type === "leave");
              const hasBooking = evts.some(e => e.type === "booking");

              let cls = "cal-day";
              if (!cell.current) cls += " other-month";
              else {
                if (isToday(cell.day)) cls += " today";
                else if (selectedDay === cell.day) cls += " selected";
                if (hasLeave) cls += " leave-day";
              }

              return (
                <div
                  key={i}
                  className={cls}
                  onClick={() => cell.current && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
                  style={{ position: "relative" }}
                >
                  <span>{cell.day}</span>
                  {/* Event dots */}
                  {cell.current && evts.length > 0 && (
                    <div style={{ position: "absolute", bottom: 4, display: "flex", gap: 2 }}>
                      {evts.slice(0, 3).map((e, j) => (
                        <div key={j} style={{
                          width: 5, height: 5, borderRadius: "50%", background: e.color
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 16, display: "flex", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            {[
              { color: "#a78bfa", label: "Leave" },
              { color: "#5b7cfa", label: "Booking" },
              { color: "#fb923c", label: "Holiday" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Day Detail / Monthly Events */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Selected Day Events */}
          <div className="card">
            <div className="card-title">
              {selectedDay
                ? `${MONTHS[currentMonth].slice(0, 3)} ${selectedDay}`
                : "Select a Day"}
            </div>
            {selectedDay && selectedEvents.length === 0 && (
              <div style={{ color: "var(--text3)", fontSize: 13, padding: "8px 0" }}>No events this day.</div>
            )}
            {selectedEvents.map((e, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "8px 0", borderBottom: i < selectedEvents.length - 1 ? "1px solid var(--border)" : "none"
              }}>
                <div style={{ width: 3, background: e.color, borderRadius: 2, alignSelf: "stretch", minHeight: 20 }} />
                <div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, textTransform: "capitalize" }}>{e.type}</div>
                </div>
              </div>
            ))}
            {selectedDay && (
              <button className="btn btn-ghost btn-sm mt-16" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setShowBookingModal(true)}>
                + Book Room This Day
              </button>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="card-title">Upcoming Events</div>
            {Object.entries(events)
              .filter(([k]) => k >= formatKey(today.getFullYear(), today.getMonth(), today.getDate()))
              .slice(0, 5)
              .map(([dateKey, evts]) => (
                <div key={dateKey} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 4 }}>{dateKey}</div>
                  {evts.map((e, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: "var(--text2)",
                      paddingLeft: 8, borderLeft: `2px solid ${e.color}`, marginBottom: 2
                    }}>{e.label}</div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Book Room Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Book a Meeting Room</div>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Booking Date</label>
              <input type="date" className="form-input"
                defaultValue={selectedDay ? formatKey(currentYear, currentMonth, selectedDay) : ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" defaultValue="09:00" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <select className="form-select" value={booking.duration} onChange={e => setBooking({ ...booking, duration: e.target.value })}>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Room</label>
              <select className="form-select">
                <option>Boardroom A (Floor 15)</option>
                <option>Meeting Room 3B (Floor 12)</option>
                <option>Conference Hall (Floor 20)</option>
                <option>Training Room (Floor 8)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Title</label>
              <input type="text" className="form-input" placeholder="e.g., Q1 Planning" />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowBookingModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                alert("Room booked successfully! (Connect to /rooms/book API)");
                setShowBookingModal(false);
              }}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}