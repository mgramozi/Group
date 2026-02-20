import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';

import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css'; // Changed to match your filename

function AppContent() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <div className="d-flex">
      <Sidebar />
      {/* The main-content class provides the 260px margin so content isn't hidden */}
      <div className="main-content flex-grow-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules" element={<Modules />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}