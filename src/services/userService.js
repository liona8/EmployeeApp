import api from './api';

export const userService = {
  // Resolve user names to employee IDs
  resolveNames: async (names) => {
    try {
      const response = await api.post('/users/resolve-names', names);
      return response.data;
    } catch (error) {
      console.error('Error resolving names:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
};