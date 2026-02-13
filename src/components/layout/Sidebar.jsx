import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/chatbot', icon: '💬', label: 'Chat Assistant' },
    { path: '/hr', icon: '👥', label: 'HR Portal' },
    { path: '/tasks', icon: '✅', label: 'My Tasks' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/documents', icon: '📄', label: 'Documents' }
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>🏢 EMP</h2>
      </div>
      <nav className="nav-menu">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="user-profile">
        <div className="avatar">JD</div>
        <div className="user-info">
          <p>John Doe</p>
          <span>Engineering</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;