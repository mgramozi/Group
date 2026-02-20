import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Define role helpers for cleaner code
  const isLecturer = userData?.role === 'Lecturer';
  const isAdmin = userData?.role === 'Admin' || userData?.role === 'Course Administrator';

  return (
    <div className="sidebar d-flex flex-column p-3 bg-dark text-white vh-100 shadow" style={{ width: '250px', position: 'fixed' }}>
      <div className="mb-4 px-2">
        <h4 className="fw-bold">CAMS</h4>
      </div>

      <nav className="nav flex-column gap-2 flex-grow-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link rounded-3 ${isActive ? 'bg-primary text-white' : 'text-white-50'}`}
        >
          📊 Dashboard
        </NavLink>

        {/* ONLY show Modules button if the user is a Lecturer */}
        {isLecturer && (
          <NavLink 
            to="/modules" 
            className={({ isActive }) => `nav-link rounded-3 ${isActive ? 'bg-primary text-white' : 'text-white-50'}`}
          >
            📂 My Modules
          </NavLink>
        )}
      </nav>

      <div className="mt-auto pt-3 border-top border-secondary text-white px-2">
        <div className="mb-3">
          <p className="m-0 fw-bold small">{user?.displayName}</p>
          <p className="m-0 smaller opacity-50">{userData?.role || 'Picking role...'}</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn btn-outline-danger btn-sm w-100 border-0 text-start"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;