import api from './api';
import { userService } from './userService';
import { leaveService } from './leaveService';
import { roomService } from './roomService';
import { bookingService } from './bookingService';
import { ticketService } from './ticketService';

// This service processes natural language and calls the appropriate API endpoints
export const aiAgentService = {
  // Process user message and determine intent
  processMessage: async (message, userId = 'EMP001') => {
    const text = message.toLowerCase();
    
    // === LEAVE RELATED ===
    if (text.includes('leave') || text.includes('vacation') || text.includes('off')) {
      if (text.includes('balance') || text.includes('how many') || text.includes('remaining')) {
        return await leaveService.getLeaveBalance(userId);
      }
      if (text.includes('apply') || text.includes('request')) {
        // Extract dates if possible, otherwise return form
        return {
          intent: 'apply_leave',
          message: "I'll help you apply for leave. Please provide:",
          required_fields: ['leave_type', 'start_date', 'end_date', 'reason']
        };
      }
      if (text.includes('validate') || text.includes('check if i can')) {
        return {
          intent: 'validate_leave',
          message: "Please provide the leave details to validate"
        };
      }
    }
    
    // === ROOM RELATED ===
    else if (text.includes('room') || text.includes('meeting') || text.includes('conference')) {
      if (text.includes('available') || text.includes('free') || text.includes('search')) {
        return {
          intent: 'search_rooms',
          message: "Let me find available rooms. When do you need it?",
          action: 'show_room_search'
        };
      }
      if (text.includes('book') || text.includes('reserve')) {
        return {
          intent: 'book_room',
          message: "I'll help you book a room. Please provide:",
          required_fields: ['room_id', 'date', 'start_time', 'duration', 'attendees']
        };
      }
      if (text.includes('amenities') || text.includes('what has')) {
        const rooms = await roomService.getAmenities();
        return rooms;
      }
    }
    
    // === BOOKING RELATED ===
    else if (text.includes('booking') || text.includes('my meetings')) {
      if (text.includes('my') || text.includes('list')) {
        return await bookingService.getBookingDetails(null, userId);
      }
      if (text.includes('cancel')) {
        return {
          intent: 'cancel_booking',
          message: "Which booking would you like to cancel? Please provide the booking ID."
        };
      }
      if (text.includes('check') && text.includes('attendee')) {
        return {
          intent: 'check_attendees',
          message: "Please provide the attendee names and meeting time"
        };
      }
    }
    
    // === SERVICE TICKET RELATED ===
    else if (text.includes('ticket') || text.includes('report') || text.includes('issue') || text.includes('problem')) {
      if (text.includes('create') || text.includes('new')) {
        return {
          intent: 'create_ticket',
          message: "I'll help you create a service ticket. What's the issue?",
          required_fields: ['issue_title', 'description', 'category', 'priority', 'location']
        };
      }
      if (text.includes('status') || text.includes('check')) {
        const tickets = await ticketService.listEmployeeTickets(userId);
        return tickets;
      }
    }
    
    // === GENERAL HELP ===
    else if (text.includes('help') || text.includes('what can you do')) {
      return {
        intent: 'help',
        message: "I can help you with:\n" +
          "• Leave management (balance, apply, validate)\n" +
          "• Room bookings (search, book, cancel, check amenities)\n" +
          "• Service tickets (create, check status)\n" +
          "• Check attendee availability\n" +
          "What would you like to do?"
      };
    }
    
    // === DEFAULT ===
    else {
      return {
        intent: 'unknown',
        message: "I'm not sure I understand. You can ask me about:\n" +
          "• Leave balance and applications\n" +
          "• Room bookings and availability\n" +
          "• Service tickets\n" +
          "Type 'help' to see all options."
      };
    }
  },
  
  // Execute a specific action based on intent
  executeAction: async (intent, data) => {
    switch (intent) {
      case 'apply_leave':
        return await leaveService.applyLeave(data);
      case 'validate_leave':
        return await leaveService.validateLeave(data);
      case 'search_rooms':
        return await roomService.searchRooms(data);
      case 'book_room':
        return await bookingService.createBooking(data);
      case 'cancel_booking':
        return await bookingService.cancelBooking(data.booking_id, data.host_user_id);
      case 'check_attendees':
        return await bookingService.checkAttendeeAvailability(
          data.attendee_ids, data.date, data.start_time, data.end_time
        );
      case 'create_ticket':
        return await ticketService.createTicket(data);
      default:
        return { message: "Action not recognized" };
    }
  }
};