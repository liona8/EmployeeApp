import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, ClipboardCheck, Bot, Ticket, UtensilsCrossed, Users, Heart, GraduationCap } from "lucide-react";
import "../../pages/all.css";

export default function Layout() {
  // On mobile we start with the drawer closed; on desktop sidebar is visible.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 768;
  });
  const navigate = useNavigate();
  const location = useLocation(); // <-- get current path

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setSidebarOpen(!mq.matches);
    sync();

    // Safari < 14 compatibility
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else mq.removeListener(sync);
    };
  }, []);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/calendar", label: "Calendar", icon: CalendarDays },
    { path: "/chat", label: "AI Assistant", icon: Bot },
    { path: "/leave", label: "Leave Management", icon: ClipboardCheck },
    { path: "/tickets", label: "Service Tickets", icon: Ticket },
    { path: "/evisitor", label: "eVisitor", icon: Users },
    { path: "/meal", label: "Meal", icon: UtensilsCrossed },
    { path: "/wellness", label: "Wellness", icon: Heart },
    { path: "/chart", label: "CHART", icon: GraduationCap },
  ];

  return (
    <div className="app-root">
      {/* Mobile top bar (hamburger + centered logo) */}
      <div className="mobile-topbar" role="banner" aria-label="Mobile header">
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          type="button"
        >
          ☰
        </button>
        <img
          src="/chg_logo.png"
          alt="Logo"
          className="mobile-brand-logo"
          draggable={false}
        />
      </div>

      {/* Only shown on mobile via CSS */}
      {sidebarOpen && (
        <div className="mobile-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-brand" style={{ justifyContent: 'center', padding: '16px 12px' }}>
          <img 
            src="/chg_logo.png" 
            alt="Logo" 
            className="brand-logo" 
            style={{ 
              width: sidebarOpen ? '80%' : '32px', 
              height: 'auto', 
              borderRadius: 8,
              transition: 'width 0.3s ease'
            }} 
          />
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
            className="btn btn-ghost btn-sm"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Logout
          </button>

          <button
            className="collapse-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
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