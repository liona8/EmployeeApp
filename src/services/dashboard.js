import api from './api';

async function getLeaveBalance(userId) {
  try {
    const response = await api.get('/leave/balance', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
     console.error('Error fetching leave balance:', error.message);
     throw error;
  }
}

async function getLeaveHistory(userId) {
  try {
    const response = await api.get('/leave/history', {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching leave history:', error.message);
     throw error;
  }
}

async function getBookingDetails(bookingId, hostUserId, startDate, endDate) {
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
}

async function listEmployeeTickets(employeeId) {
  try {
    const response = await api.get(`/service-tickets/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error listing tickets:', error);
    throw error;
  }
}

export const dashboardService = {
  getLeaveBalance,
  getLeaveHistory,
  getBookingDetails,
  listEmployeeTickets
};
