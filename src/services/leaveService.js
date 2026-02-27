import api from './api';

export const leaveService = {

  // Get full leave balance summary
  getLeaveBalance: async (userId) => {
    try {
      const response = await api.get('/leave/balance', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLeaveHistory: async (userId) => {
    try {
      const response = await api.get('/leave/history', {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave history:', error.message);
      throw error;
    }
  },

  // Optional: calculate entitlement comparison
  calculateEntitlement: async (userId, leaveType) => {
    try {
      const response = await api.get('/leave/calculate_entitlement', {
        params: {
          user_id: userId,
          leave_type: leaveType
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};