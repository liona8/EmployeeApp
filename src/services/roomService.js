const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const roomService = {
  // Already existing
  fetchBookings: async ({ host_user_id, start_date, end_date }) => {
    const res = await fetch(
      `${API_BASE}/bookings/details?host_user_id=${host_user_id}&start_date=${start_date}&end_date=${end_date}`
    );
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
  },

  // NEW: Search available rooms for a given timeslot
  searchAvailableRooms: async ({ booking_date, start_time_iso, duration_minutes, min_capacity = 1 }) => {
    const params = new URLSearchParams({
      booking_date,
      start_time_iso,
      duration_minutes,
      min_capacity,
    });
    const res = await fetch(`${API_BASE}/rooms/search?${params}`);
    if (!res.ok) throw new Error("Failed to search rooms");
    return res.json(); // { available_rooms: [...], count: N }
  },

  // NEW: Create a room booking
  createBooking: async ({ room_id, booking_date, start_time_iso, duration_minutes, host_user_id, meeting_title, attendee_user_ids = [] }) => {
    const res = await fetch(`${API_BASE}/rooms/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_id,
        booking_date,
        start_time_iso,
        duration_minutes,
        host_user_id,
        meeting_title,
        attendee_user_ids,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to create booking");
    return data; // { success, booking_id, confirmation_message, booking_details }
  },

  resolveUserNames: async (names) => {
    const res = await fetch(`${API_BASE}/users/resolve-names`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(names),
    });
    if (!res.ok) throw new Error("Failed to resolve names");
    return res.json();
  },

  validateBookingTime: async ({ booking_date, start_time_iso, duration_minutes }) => {
    const params = new URLSearchParams({ booking_date, start_time_iso, duration_minutes });
    const res = await fetch(`${API_BASE}/bookings/validate-time?${params}`);
    if (!res.ok) throw new Error("Validation request failed");
    return res.json(); // { is_valid, error, booking_summary }
  },

  checkAttendeeAvailability: async ({ attendee_user_ids, booking_date, start_time_iso, end_time_iso }) => {
    const res = await fetch(`${API_BASE}/attendees/check-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendee_user_ids, booking_date, start_time_iso, end_time_iso }),
    });
    if (!res.ok) throw new Error("Failed to check attendee availability");
    return res.json(); // { all_available, conflicts, available_users }
  },
};