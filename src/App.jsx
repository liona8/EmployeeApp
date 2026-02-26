import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ChatbotPage from './pages/ChatbotPage';
import HRPage from './pages/HRPage';
// import TasksPage from './pages/TasksPage';
// import CalendarPage from './pages/CalendarPage';
// import DocumentsPage from './pages/DocumentsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/hr" element={<HRPage />} />
          {/* <Route path="/tasks" element={<TasksPage />} /> */}
          {/* <Route path="/calendar" element={<CalendarPage />} /> */}
          {/* <Route path="/documents" element={<DocumentsPage />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;