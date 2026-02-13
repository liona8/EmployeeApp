import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    { 
      id: 1, 
      name: 'Chat Assistant', 
      icon: '💬', 
      path: '/chatbot',
      description: 'AI-powered employee support',
      stats: '3 pending queries',
      color: '#667eea'
    },
    { 
      id: 2, 
      name: 'HR Portal', 
      icon: '👥', 
      path: '/hr',
      description: 'Leave, salary, benefits',
      stats: '15 vacation days left',
      color: '#f59e0b'
    },
    { 
      id: 3, 
      name: 'My Tasks', 
      icon: '✅', 
      path: '/tasks',
      description: 'Manage your assignments',
      stats: '5 tasks pending',
      color: '#10b981'
    },
    { 
      id: 4, 
      name: 'Calendar', 
      icon: '📅', 
      path: '/calendar',
      description: 'Meetings & events',
      stats: '2 meetings today',
      color: '#ef4444'
    },
    { 
      id: 5, 
      name: 'Documents', 
      icon: '📄', 
      path: '/documents',
      description: 'Company resources',
      stats: '12 documents',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>Welcome back, John! 👋</h1>
        <p>Here's what's happening today</p>
      </div>

      <div className="modules-grid">
        {modules.map(module => (
          <div 
            key={module.id} 
            className="module-card"
            onClick={() => navigate(module.path)}
            style={{ borderTop: `4px solid ${module.color}` }}
          >
            <div className="module-icon" style={{ background: `${module.color}20` }}>
              {module.icon}
            </div>
            <h2>{module.name}</h2>
            <p>{module.description}</p>
            <span className="module-stats">{module.stats}</span>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button onClick={() => navigate('/chatbot')}>💬 Ask Assistant</button>
          <button onClick={() => navigate('/hr')}>📅 Apply Leave</button>
          <button onClick={() => navigate('/tasks')}>✅ View Tasks</button>
          <button onClick={() => navigate('/calendar')}>📋 Check Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;