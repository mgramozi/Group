import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleSelection = () => {
  const { updateUserRole } = useAuth();

  const roles = [
    { id: 'Lecturer', icon: '👨‍🏫', desc: 'Create and manage modules' },
    { id: 'Moderator', icon: '⚖️', desc: 'Review assessment materials' },
    { id: 'External Examiner', icon: '🔍', desc: 'Read-only quality review' },
    { id: 'Course Administrator', icon: '⚙️', desc: 'System oversight & users' }
  ];

  return (
    <div className="login-bg d-flex align-items-center justify-content-center">
      <div className="card border-0 shadow-lg p-5 text-center" style={{maxWidth: '650px', borderRadius: '25px'}}>
        <h3 className="fw-bold mb-4">Select Your Role</h3>
        <div className="row g-3 text-start">
          {roles.map(role => (
            <div key={role.id} className="col-md-6">
              <div 
                className="p-3 border rounded-4 hover-shadow" 
                onClick={() => updateUserRole(role.id)}
                style={{ cursor: 'pointer', transition: '0.2s' }}
              >
                <div className="fs-3 mb-1">{role.icon}</div>
                <h6 className="fw-bold mb-0">{role.id}</h6>
                <p className="smaller text-muted mb-0">{role.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;