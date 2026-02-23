import api from './api';

export const ticketService = {
  // Create service ticket
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/service-ticket/create', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Get ticket status
  getTicketStatus: async (ticketId) => {
    try {
      const response = await api.get(`/service-tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // List employee tickets
  listEmployeeTickets: async (employeeId) => {
    try {
      const response = await api.get(`/service-tickets/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error listing tickets:', error);
      throw error;
    }
  }
};