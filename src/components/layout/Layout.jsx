import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, ClipboardCheck, Bot, Ticket } from "lucide-react";
import "../../pages/all.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // <-- get current path

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/calendar", label: "Calendar", icon: CalendarDays },
    { path: "/chat", label: "AI Assistant", icon: Bot },
    { path: "/leave", label: "Leave Management", icon: ClipboardCheck },
    { path: "/tickets", label: "Service Tickets", icon: Ticket }, // <-- changed icon
  ];

  return (
    <div className="app-root">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">CH</div>
          {sidebarOpen && <span className="brand-name">Chin Hin</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path; // <-- check if active
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? "active" : ""}`} // <-- add active class
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </button>

          <button
            className="collapse-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}