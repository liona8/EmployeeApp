// bookingService.js
import api from './api'; // make sure api is your axios instance

export const bookingService = {
  fetchBookings: async ({ host_user_id, start_date, end_date }) => {
    try {
      const response = await api.get('/bookings/details', {
        params: {
          host_user_id,
          start_date,
          end_date
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
};