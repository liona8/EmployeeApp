import api from './api';

export const ticketService = {
  // Create service ticket — calls POST /service-ticket/create
  createTicket: async (ticketData) => {
    try {
      // The backend expects each field as an embedded body param (embed=True in FastAPI)
      // so we send them all at the top level of the JSON body.
      const payload = {
        employee_id:  ticketData.employee_id,
        issue_title:  ticketData.issue_title,
        description:  ticketData.description,
        category:     ticketData.category,
        priority:     ticketData.priority,
        location: {
          room:     ticketData.location.room,
          floor:    ticketData.location.floor,
          building: ticketData.location.building || 'HQ Tower',
        },
        photo_url: ticketData.photo_url ?? null,
      };

      const response = await api.post('/service-ticket/create', payload);
      // Backend returns: { message, ticket_details }
      return response.data.ticket_details;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Get single ticket by ID
  getTicketStatus: async (ticketId) => {
    try {
      const response = await api.get(`/service-tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // List all tickets for an employee
  listEmployeeTickets: async (employeeId) => {
    try {
      const response = await api.get(`/service-tickets/employee/${employeeId}`);
      return response.data; // { tickets: [...], total_count: N }
    } catch (error) {
      console.error('Error listing tickets:', error);
      throw error;
    }
  },
};