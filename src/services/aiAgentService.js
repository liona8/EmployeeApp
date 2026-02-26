import api from './api';

export const aiAgentService = {
  // Send user message to AI backend
  async processMessage(message, userId = 'EMP001') {
    try {
      const response = await api.post('/api/ai/chat', {
        message,
        user_id: userId
      });

      console.log('🤖 AI Backend Raw Response:', response.data);

      return {
        message: response.data.reply || response.data.message || "No reply from AI",
        intent: response.data.intent || null,
        required_fields: response.data.required_fields || null,
        data: response.data.data || null
      };
    } catch (error) {
      console.error('❌ AI Agent Service Error:', error);
      throw error;
    }
  },

  // Execute backend actions for multi-step intents
  async executeAction(intent, payload) {
    try {
      switch (intent) {
        case 'apply_leave':
          return (await api.post('/leave/apply', payload)).data;
        case 'check_leave_balance':
          return (await api.get(`/leave/balance/${payload.employee_id}`)).data;
        case 'search_rooms':
          return (await api.get('/rooms')).data;
        case 'book_room':
          return (await api.post('/rooms/book', payload)).data;
        case 'create_ticket':
          return (await api.post('/tickets', payload)).data;
        default:
          throw new Error(`Unknown intent: ${intent}`);
      }
    } catch (error) {
      console.error('❌ Action execution error:', error);
      throw error;
    }
  }
};