import React, { useState, useEffect } from "react";
import "./all.css";
import { calanderService } from "../services/calanderService";
import { leaveService} from "../services/leaveService";
import { roomService } from "../services/roomService";
import { bookingService } from "../services/bookingService";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentUserId = "EMP001";

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
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [booking, setBooking] = useState({ room: "", title: "", time: "", duration: "60" });
  const [events, setEvents] = useState([]);
  const [bookingStep, setBookingStep] = useState("form"); // "form" | "rooms" | "success"
  const [bookingForm, setBookingForm] = useState({
    date: "",
    start_time: "09:00",
    duration: "60",
    meeting_title: "",
    min_capacity: 1,
    attendee_input: "",
    attendees: [],
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [attendeeSearch, setAttendeeSearch] = useState([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [attendeeError, setAttendeeError] = useState(null);

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);
  const prevDays = getDaysInMonth(currentYear, currentMonth - 1);
  const [bookingValidation, setBookingValidation] = useState(null);
  const [attendeeConflicts, setAttendeeConflicts] = useState([]);

  useEffect(() => {
    const startDate = formatKey(currentYear, currentMonth, 1);
    const endDate = formatKey(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));

    // Fetch bookings
    calanderService.fetchBookings({ host_user_id: currentUserId, start_date: startDate, end_date: endDate })
      .then(data => {
        const mapped = {};
        data.bookings.forEach(b => {
          if (!mapped[b.date]) mapped[b.date] = [];
          mapped[b.date].push({
            type: "booking",
            label: b.meeting_title,
            color: "#5b7cfa",
            details: b
          });
        });
        setEvents(prev => ({ ...prev, ...mapped }));
      })
      .catch(err => console.error(err));

    // Fetch leaves
    leaveService.getLeaveHistory(currentUserId)
      .then(data => {

        const leaveArray = data.leaves || data;
        const mapped = {};
        leaveArray.forEach(l => {
          let current = new Date(l.start_date);
          const end = new Date(l.end_date);
          while (current <= end) {
            const key = current.toISOString().split("T")[0];
            if (!mapped[key]) mapped[key] = [];
            mapped[key].push({
              type: "leave",
              label: l.leave_type,
              color: "#a78bfa"
            });
            current.setDate(current.getDate() + 1);
          }
        });

        setEvents(prev => ({ ...prev, ...mapped }));

      })
      .catch(err => console.error(err));

  }, [currentYear, currentMonth]);

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

  const openBookingModal = () => {
    setBookingForm(prev => ({
      ...prev,
      date: selectedDay ? formatKey(currentYear, currentMonth, selectedDay) : "",
    }));
    setBookingStep("form");
    setBookingError(null);
    setSelectedRoom(null);
    setAvailableRooms([]);
    setShowBookingModal(true);
  };

  const handleSearchRooms = async () => {
    setBookingError(null);
    setBookingValidation(null);
    setAttendeeConflicts([]);

    // Frontend pre-checks
    const preErrors = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!bookingForm.date) preErrors.push("Please select a booking date.");
    if (!bookingForm.start_time) preErrors.push("Please select a start time.");

    if (bookingForm.date) {
      const selectedDate = new Date(bookingForm.date);
      if (selectedDate < today) preErrors.push("Booking date cannot be in the past.");
    }

    if (!bookingForm.meeting_title.trim()) preErrors.push("Please enter a meeting title.");

    if (preErrors.length > 0) {
      setBookingError(preErrors.join(" "));
      return;
    }

    setBookingLoading(true);

    try {
      const start_time_iso = `${bookingForm.date}T${bookingForm.start_time}:00+08:00`;
      const duration = parseInt(bookingForm.duration);

      // Step 1: Validate booking time against backend
      const timeValidation = await bookingService.validateBookingTime({
        booking_date: bookingForm.date,
        start_time_iso,
        duration_minutes: duration,
      });

      setBookingValidation(timeValidation);

      if (!timeValidation.is_valid) {
        setBookingError(timeValidation.error);
        setBookingLoading(false);
        return;
      }

      // Step 2: Check attendee availability if any attendees added
      if (bookingForm.attendees.length > 0) {
        const endDt = new Date(new Date(start_time_iso).getTime() + duration * 60000);
        const end_time_iso = endDt.toISOString().replace("Z", "+08:00");

        const availabilityResult = await bookingService.checkAttendeeAvailability({
          attendee_user_ids: bookingForm.attendees.map(a => a.user_id),
          booking_date: bookingForm.date,
          start_time_iso,
          end_time_iso,
        });

        if (!availabilityResult.all_available) {
          setAttendeeConflicts(availabilityResult.conflicts);
          // Don't block — just warn, user can still proceed
        }
      }

      // Step 3: Search available rooms
      const result = await bookingService.searchAvailableRooms({
        booking_date: bookingForm.date,
        start_time_iso,
        duration_minutes: duration,
        min_capacity: bookingForm.min_capacity,
      });

      if (result.count === 0) {
        setBookingError("No rooms available for this timeslot. Try a different time.");
      } else {
        setAvailableRooms(result.available_rooms);
        setBookingStep("rooms");
      }

    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAttendeeSearch = async () => {
    const input = bookingForm.attendee_input.trim();
    if (!input) return;

    setAttendeeLoading(true);
    setAttendeeError(null);

    try {
      const names = input.split(",").map(n => n.trim()).filter(Boolean);
      const result = await roomService.resolveUserNames(names);

      // Show resolved results as selectable options
      const options = [
        ...result.results.resolved.map(r => ({
          user_id: r.user_id,
          name: r.full_name,
          department: r.department,
          status: "resolved",
        })),
        ...result.results.ambiguous.flatMap(a =>
          a.matches.map(m => ({
            user_id: m.user_id,
            name: m.full_name,
            department: m.department,
            status: "ambiguous",
            input_name: a.input_name,
          }))
        ),
      ];

      if (options.length === 0) {
        setAttendeeError(`No employees found for: ${result.results.not_found.map(n => n.input_name).join(", ")}`);
      }

      setAttendeeSearch(options);
    } catch (err) {
      setAttendeeError(err.message);
    } finally {
      setAttendeeLoading(false);
    }
  };

  const addAttendee = (person) => {
    // Prevent duplicates and prevent adding yourself
    if (person.user_id === currentUserId) {
      setAttendeeError("You are already the host.");
      return;
    }
    if (bookingForm.attendees.find(a => a.user_id === person.user_id)) {
      setAttendeeError(`${person.name} is already added.`);
      return;
    }
    setBookingForm(prev => ({
      ...prev,
      attendees: [...prev.attendees, { user_id: person.user_id, name: person.name }],
      attendee_input: "",
    }));
    setAttendeeSearch([]);
    setAttendeeError(null);
  };

  const removeAttendee = (user_id) => {
    setBookingForm(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a.user_id !== user_id),
    }));
  };

  // Step 2: Confirm booking with selected room
  const handleConfirmBooking = async () => {
    if (!selectedRoom) {
      setBookingError("Please select a room.");
      return;
    }
    setBookingLoading(true);
    setBookingError(null);
    try {
      const start_time_iso = `${bookingForm.date}T${bookingForm.start_time}:00+08:00`;
      const result = await roomService.createBooking({
        room_id: selectedRoom.id,
        booking_date: bookingForm.date,
        start_time_iso,
        duration_minutes: parseInt(bookingForm.duration),
        host_user_id: currentUserId,
        meeting_title: bookingForm.meeting_title || "Meeting",
        attendee_user_ids: bookingForm.attendees.map(a => a.user_id),
      });
      setBookingSuccess(result);
      setBookingStep("success");

      // Refresh calendar events for the current month
      const startDate = formatKey(currentYear, currentMonth, 1);
      const endDate = formatKey(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));
      const data = await roomService.fetchBookings({ host_user_id: currentUserId, start_date: startDate, end_date: endDate });
      const mapped = {};
      data.bookings.forEach(b => {
        if (!mapped[b.date]) mapped[b.date] = [];
        mapped[b.date].push({ type: "booking", label: b.meeting_title, color: "#5b7cfa" });
      });
      setEvents(prev => ({ ...prev, ...mapped }));
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">Calendar</div>
            <div className="page-subtitle">Leave schedule & room bookings</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openBookingModal}>+ Book Room</button>
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
              {selectedDay ? `${MONTHS[currentMonth].slice(0, 3)} ${selectedDay}` : "Select a Day"}
            </div>

            {selectedDay && selectedEvents.length === 0 && (
              <div style={{ color: "var(--text3)", fontSize: 13, padding: "8px 0" }}>No events this day.</div>
            )}

            {selectedEvents.map((e, i) => (
              <div
                key={i}
                onClick={() => setSelectedEvent(selectedEvent?.details?.booking_id === e.details?.booking_id ? null : e)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  marginBottom: 6,
                  cursor: e.type === "booking" ? "pointer" : "default",
                  background: selectedEvent?.details?.booking_id === e.details?.booking_id
                    ? "rgba(91,124,250,0.08)" : "transparent",
                  border: `1px solid ${selectedEvent?.details?.booking_id === e.details?.booking_id
                    ? "var(--accent)" : "transparent"}`,
                  transition: "all 0.15s",
                  borderBottom: i < selectedEvents.length - 1 ? "1px solid var(--border)" : "none"
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 3, background: e.color, borderRadius: 2, alignSelf: "stretch", minHeight: 20 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{e.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, textTransform: "capitalize" }}>{e.type}</div>

                    {/* Expanded booking detail — shows when clicked */}
                    {e.type === "booking" && selectedEvent?.details?.booking_id === e.details?.booking_id && e.details && (
                      <div style={{
                        marginTop: 10,
                        padding: "10px 12px",
                        background: "var(--bg2)",
                        borderRadius: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6
                      }}>
                        {[
                          { icon: "🏢", label: "Room", value: e.details.room_name },
                          { icon: "📍", label: "Floor", value: e.details.room_location ? `Floor ${e.details.room_location}` : null },
                          { icon: "🕐", label: "Time", value: e.details.time },
                          { icon: "👥", label: "Capacity", value: e.details.room_capacity ? `${e.details.room_capacity} seats` : null },
                          { icon: "🪪", label: "Host", value: e.details.host_name },
                          { icon: "🆔", label: "Booking ID", value: e.details.booking_id },
                        ]
                          .filter(row => row.value)
                          .map((row, j) => (
                            <div key={j} style={{ display: "flex", gap: 8, fontSize: 11 }}>
                              <span>{row.icon}</span>
                              <span style={{ color: "var(--text3)", minWidth: 60 }}>{row.label}</span>
                              <span style={{ color: "var(--text)", fontWeight: 500 }}>{row.value}</span>
                            </div>
                          ))}

                        {/* Attendees */}
                        {e.details.attendees?.length > 0 && (
                          <div style={{ display: "flex", gap: 8, fontSize: 11, alignItems: "flex-start" }}>
                            <span>👤</span>
                            <span style={{ color: "var(--text3)", minWidth: 60 }}>Attendees</span>
                            <span style={{ color: "var(--text)", fontWeight: 500 }}>
                              {e.details.attendees.map(a => a.name || a).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Leave detail */}
                    {e.type === "leave" && (
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, textTransform: "capitalize" }}>
                        {e.label.replace(/_/g, " ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {selectedDay && (
              <button className="btn btn-ghost btn-sm mt-16"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={openBookingModal}>
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

            {/* STEP: SUCCESS */}
            {bookingStep === "success" && bookingSuccess && (
              <>
                <div className="modal-header">
                  <div className="modal-title">Booking Confirmed ✅</div>
                  <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
                </div>
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>
                    {bookingSuccess.confirmation_message}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
                    Booking ID: <strong>{bookingSuccess.booking_id}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
                    Room: <strong>{bookingSuccess.booking_details.room_name}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
                    {bookingSuccess.booking_details.date} · {bookingForm.start_time} · {bookingForm.duration} min
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowBookingModal(false)}>Done</button>
                </div>
              </>
            )}

            {/* STEP: ROOM SELECTION */}
            {bookingStep === "rooms" && (
              <>
                <div className="modal-header">
                  <div className="modal-title">Select a Room</div>
                  <button className="modal-close" onClick={() => setBookingStep("form")}>‹ Back</button>
                </div>
                <div style={{ marginBottom: 12, fontSize: 12, color: "var(--text3)" }}>
                  {bookingForm.date} · {bookingForm.start_time} · {bookingForm.duration} min
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto", marginBottom: 16 }}>
                  {availableRooms.map(room => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: `2px solid ${selectedRoom?.id === room.id ? "var(--accent)" : "var(--border)"}`,
                        background: selectedRoom?.id === room.id ? "rgba(91,124,250,0.06)" : "var(--bg2)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{room.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", display: "flex", gap: 12 }}>
                        <span>Floor {room.location}</span>
                        <span>👥 {room.capacity} seats</span>
                        <span>⭐ Score: {room.suitability_score}</span>
                      </div>
                      {room.amenities?.length > 0 && (
                        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>
                          {room.amenities.slice(0, 4).join(" · ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {bookingError && (
                  <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 10 }}>✕ {bookingError}</div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={() => setBookingStep("form")}>Back</button>
                  <button className="btn btn-primary" onClick={handleConfirmBooking} disabled={bookingLoading || !selectedRoom}>
                    {bookingLoading ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </>
            )}

            {/* STEP: FORM */}
            {bookingStep === "form" && (
              <>
                <div className="modal-header">
                  <div className="modal-title">Book a Meeting Room</div>
                  <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Date</label>
                  <input type="date" className="form-input" value={bookingForm.date}
                    onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={bookingForm.start_time}
                    onChange={e => setBookingForm({ ...bookingForm, start_time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-select" value={bookingForm.duration}
                    onChange={e => setBookingForm({ ...bookingForm, duration: e.target.value })}>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Capacity</label>
                  <input type="number" className="form-input" min={1} value={bookingForm.min_capacity}
                    onChange={e => setBookingForm({ ...bookingForm, min_capacity: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Title</label>
                  <input type="text" className="form-input" placeholder="e.g., Q1 Planning"
                    value={bookingForm.meeting_title}
                    onChange={e => setBookingForm({ ...bookingForm, meeting_title: e.target.value })} />
                </div>

                {/* Attendees Search */}
                <div className="form-group">
                  <label className="form-label">Attendees</label>

                  {/* Added attendees chips */}
                  {bookingForm.attendees.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {bookingForm.attendees.map(a => (
                        <div key={a.user_id} style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "rgba(91,124,250,0.12)", border: "1px solid rgba(91,124,250,0.3)",
                          borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "var(--accent)"
                        }}>
                          <span>{a.name}</span>
                          <span
                            onClick={() => removeAttendee(a.user_id)}
                            style={{ cursor: "pointer", fontSize: 14, lineHeight: 1, color: "var(--text3)" }}
                          >×</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search input + button */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Type name(s), comma-separated..."
                      value={bookingForm.attendee_input}
                      onChange={e => {
                        setBookingForm({ ...bookingForm, attendee_input: e.target.value });
                        setAttendeeSearch([]);
                        setAttendeeError(null);
                      }}
                      onKeyDown={e => e.key === "Enter" && handleAttendeeSearch()}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={handleAttendeeSearch}
                      disabled={attendeeLoading || !bookingForm.attendee_input.trim()}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {attendeeLoading ? "..." : "Search"}
                    </button>
                  </div>

                  {/* Search results dropdown */}
                  {attendeeSearch.length > 0 && (
                    <div style={{
                      marginTop: 4, border: "1px solid var(--border)", borderRadius: 8,
                      background: "var(--bg2)", overflow: "hidden"
                    }}>
                      {attendeeSearch.map((person, i) => (
                        <div
                          key={person.user_id}
                          onClick={() => addAttendee(person)}
                          style={{
                            padding: "8px 12px", cursor: "pointer",
                            borderBottom: i < attendeeSearch.length - 1 ? "1px solid var(--border)" : "none",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(91,124,250,0.06)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div>
                            <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{person.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text3)" }}>{person.job_title} · {person.department}</div>
                          </div>
                          <span style={{ fontSize: 11, color: "var(--accent)" }}>+ Add</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {attendeeError && (
                    <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>✕ {attendeeError}</div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                    Search by name and click to add. Separate multiple names with commas.
                  </div>
                </div>

                {/* Time summary — shown after successful validation */}
                {bookingValidation?.is_valid && bookingValidation?.booking_summary && (
                  <div style={{
                    background: "rgba(91,124,250,0.06)", border: "1px solid rgba(91,124,250,0.2)",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>✓ Time Validated</div>
                    {[
                      { label: "Day", value: bookingValidation.booking_summary.day_of_week },
                      { label: "Time", value: `${bookingValidation.booking_summary.start_time} – ${bookingValidation.booking_summary.end_time}` },
                      { label: "Duration", value: `${bookingValidation.booking_summary.duration_minutes} min` },
                      { label: "Starts in", value: bookingValidation.booking_summary.time_until_meeting },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "var(--text2)", marginTop: 3 }}>
                        <span>{row.label}</span>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attendee conflicts warning — non-blocking */}
                {attendeeConflicts.length > 0 && (
                  <div style={{
                    background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 6 }}>⚠ Attendee Conflicts</div>
                    {attendeeConflicts.map((c, i) => (
                      <div key={i} style={{ color: "var(--text2)", marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, color: "var(--text)" }}>{c.user_name}</span>
                        {" "}is busy {c.conflict_start_formatted} – {c.conflict_end_formatted}
                        {c.event_title && <span style={{ color: "var(--text3)" }}> ({c.event_title})</span>}
                      </div>
                    ))}
                    <div style={{ color: "var(--text3)", marginTop: 6, fontStyle: "italic" }}>
                      You can still proceed — conflicting attendees will be notified.
                    </div>
                  </div>
                )}

                {/* Error */}
                {bookingError && (
                  <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 10 }}>✕ {bookingError}</div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setShowBookingModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSearchRooms} disabled={bookingLoading}>
                    {bookingLoading ? "Searching..." : "Search Available Rooms →"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
