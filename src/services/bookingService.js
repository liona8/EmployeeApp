import api from './api';

export const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/rooms/book', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId, hostUserId, startDate, endDate) => {
    try {
      const params = {};
      if (bookingId) params.booking_id = bookingId;
      if (hostUserId) params.host_user_id = hostUserId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/bookings/details', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await api.patch(`/bookings/update/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, hostUserId) => {
    try {
      const response = await api.patch(`/bookings/cancel/${bookingId}`, { 
        host_user_id: hostUserId 
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  // Check attendee availability
  checkAttendeeAvailability: async (attendeeUserIds, bookingDate, startTimeIso, endTimeIso) => {
    try {
      const response = await api.post('/attendees/check-availability', {
        attendee_user_ids: attendeeUserIds,
        booking_date: bookingDate,
        start_time_iso: startTimeIso,
        end_time_iso: endTimeIso
      });
      return response.data;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  },

  // Validate booking time
  validateBookingTime: async (bookingDate, startTimeIso, durationMinutes) => {
    try {
      const response = await api.get('/bookings/validate-time', {
        params: {
          booking_date: bookingDate,
          start_time_iso: startTimeIso,
          duration_minutes: durationMinutes
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating booking time:', error);
      throw error;
    }
  },

  // Suggest alternative times
  suggestAlternatives: async (params) => {
    try {
      const response = await api.get('/rooms/suggest-alternatives', { params });
      return response.data;
    } catch (error) {
      console.error('Error suggesting alternatives:', error);
      throw error;
    }
  }
};