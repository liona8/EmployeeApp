import api from './api';

export const roomService = {
  // Get all rooms
  getRooms: async (location) => {
    try {
      const response = await api.get('/rooms', { params: { location } });
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Search available rooms
  searchRooms: async (searchParams) => {
    try {
      const response = await api.get('/rooms/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw error;
    }
  },

  // Get room amenities
  getAmenities: async (roomId, category) => {
    try {
      const response = await api.get('/rooms/amenities', { 
        params: { room_id: roomId, category } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      throw error;
    }
  },

  // Update room status
  updateRoomStatus: async (roomId, isActive, reason) => {
    try {
      const response = await api.patch(`/rooms/${roomId}`, { is_active: isActive, reason });
      return response.data;
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  }
};