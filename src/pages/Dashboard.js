import React from 'react';
import { useAuth } from '../context/AuthContext';
import RoleSelection from './RoleSelection';
import LecturerDashboard from './roles/LecturerDashboard';
import ModeratorDashboard from './roles/ModeratorDashboard';
import AdminDashboard from './roles/AdminDashboard';
import ExaminerDashboard from './roles/ExaminerDashboard';

const Dashboard = () => {
  const { userData, loading } = useAuth();

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  // If no data, show selection
  if (!userData || !userData.role) {
    return <RoleSelection />;
  }

  // --- THE FIX: Clean the string of all spaces ---
  const cleanRole = userData.role.toString().trim().toLowerCase();

  // Emergency Log to verify the cleaned version
  console.log("CLEANED ROLE CHECK:", `"${cleanRole}"`);

  // Use .includes to catch "admin " or " admin"
  if (cleanRole.includes('admin')) {
    return <AdminDashboard />;
  } 
  
  if (cleanRole.includes('moderator')) {
    return <ModeratorDashboard />;
  }

  if (cleanRole.includes('lecturer')) {
    return <LecturerDashboard />;
  }

  if (cleanRole.includes('examiner')) {
    return <ExaminerDashboard />;
  }

  // Final fallback if nothing matches
  return <RoleSelection />;
};

export default Dashboard;