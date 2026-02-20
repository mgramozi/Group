import React from 'react';

const ExaminerDashboard = () => {
  return (
    <div className="p-4">
      <h2 className="fw-bold mb-1">External Examination Portal</h2>
      <p className="text-muted mb-4">View assigned module materials (Read-Only)</p>
      <div className="alert alert-info border-0 rounded-4">
        Note: Lecture slides are hidden unless specific access is granted by the Administrator.
      </div>
    </div>
  );
};

export default ExaminerDashboard;