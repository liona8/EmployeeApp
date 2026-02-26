import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ChatbotPage from './pages/ChatbotPage';
// import HRPage from './pages/HRPage';
// import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
// import DocumentsPage from './pages/DocumentsPage';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "calendar", label: "Calendar", icon: "◫" },
    { id: "leave", label: "Leave Management", icon: "◉" },
    { id: "chat", label: "AI Assistant", icon: "◈" },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard setActivePage={setActivePage} />;
      case "calendar": return <CalendarPage />;
      case "leave": return <LeaveManagement />;
      case "chat": return <ChatbotPage />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-root">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">CH</div>
          {sidebarOpen && <span className="brand-name">Chin Hin</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar-mini">
            <div className="avatar-circle">A</div>
            {sidebarOpen && (
              <div className="user-info-mini">
                <span className="user-name-mini">Ahmad Razif</span>
                <span className="user-id-mini">EMP001</span>
              </div>
            )}
          </div>
          <button className="collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}