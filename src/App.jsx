import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ChatbotPage from "./pages/ChatbotPage";
import CalendarPage from "./pages/CalendarPage";
import LeaveManagement from "./pages/LeaveManagementPage";
import ServiceTicketsPage from "./pages/ServiceTicketPage";
import MealPage from "./pages/Meal";
import EVisitorPage from "./pages/eVisitor";
import WellnessPage from "./pages/Wellness";
import ChartPage from "./pages/Chart";
import WalkthroughPage from "./pages/Walkthrough";
import LoginPage from "./pages/login";
import Layout from "../src/components/layout/Layout";

import "./App.css";

export default function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(
  //   localStorage.getItem("token") ? true : false
  // );
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check sessionStorage on first render
    return !!sessionStorage.getItem("session");
  });

  return (
    <Router>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Walkthrough */}
        <Route
          path="/walkthrough"
          element={isAuthenticated ? <WalkthroughPage /> : <Navigate to="/login" />}
        />

        {/* Protected Layout */}
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="chat" element={<ChatbotPage />} />
            <Route path="tickets" element={<ServiceTicketsPage />} />
            <Route path="meal" element={<MealPage />} />
            <Route path="evisitor" element={<EVisitorPage />} />
            <Route path="wellness" element={<WellnessPage />} />
            <Route path="chart" element={<ChartPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

      </Routes>
    </Router>
  );
}