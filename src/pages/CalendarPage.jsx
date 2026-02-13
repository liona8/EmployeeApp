import React from 'react';

const CalendarPage = () => {
  const meetings = [
    { id: 1, title: 'Team Standup', time: '10:00 AM', date: 'Today', attendees: 8 },
    { id: 2, title: 'Project Review', time: '2:00 PM', date: 'Today', attendees: 5 },
    { id: 3, title: '1:1 with Manager', time: '11:00 AM', date: 'Tomorrow', attendees: 2 },
    { id: 4, title: 'Sprint Planning', time: '9:30 AM', date: 'Feb 16', attendees: 6 }
  ];

  return (
    <div className="calendar-page">
      <h1>📅 Calendar</h1>
      
      <div className="calendar-header">
        <h2>Upcoming Meetings</h2>
        <button className="schedule-btn">+ Schedule Meeting</button>
      </div>

      <div className="meetings-list">
        {meetings.map(meeting => (
          <div key={meeting.id} className="meeting-card">
            <div className="meeting-date">
              <span className="date">{meeting.date}</span>
              <span className="time">{meeting.time}</span>
            </div>
            <div className="meeting-info">
              <h3>{meeting.title}</h3>
              <span className="attendees">👥 {meeting.attendees} attendees</span>
            </div>
            <button className="join-btn">Join</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;