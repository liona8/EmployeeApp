import api from './api';

export const leaveService = {
  // Get leave balance - requires user_id AND current_date
  getLeaveBalance: async (userId) => {
    try {
      // Format today's date as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      console.log('🔍 Fetching leave balance for:', { user_id: userId, current_date: today });
      
      const response = await api.get('/leave/balance', {
        params: { 
          user_id: userId, 
          current_date: today 
        }
      });
      
      console.log('✅ Leave balance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching leave balance:', error);
      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.data);
        throw new Error(error.response.data.detail || 'Server error');
      } else if (error.request) {
        // No response received
        console.error('No response from server');
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        // Request setup error
        console.error('Request error:', error.message);
        throw error;
      }
    }
  },

  // Validate leave request
  validateLeave: async (leaveData) => {
    try {
      console.log('🔍 Validating leave:', leaveData);
      const response = await api.post('/leave/validate', leaveData);
      return response.data;
    } catch (error) {
      console.error('❌ Error validating leave:', error);
      throw error;
    }
  },

  // Apply for leave
  applyLeave: async (leaveApplication) => {
    try {
      console.log('🔍 Applying for leave:', leaveApplication);
      const response = await api.post('/leave/apply', leaveApplication);
      return response.data;
    } catch (error) {
      console.error('❌ Error applying for leave:', error);
      throw error;
    }
  }
};