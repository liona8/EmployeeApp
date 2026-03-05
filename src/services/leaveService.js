import api from './api';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

  applyLeave: async (payload) => {
    const res = await fetch(`${API_BASE}/leave/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      // Backend returns { detail: { errors: [...], warnings: [...] } } on 400
      throw { status: res.status, detail: data.detail };
    }
    return data;
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