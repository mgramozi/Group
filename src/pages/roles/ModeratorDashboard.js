import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const [assignedModules, setAssignedModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "modules"), where("moderatorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssignedModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleUpdateStatus = async (moduleId, newStatus) => {
    let feedback = "";
    if (newStatus === 'Needs Revision') {
      feedback = prompt("Please provide feedback for the lecturer:");
      if (!feedback) return; // Cancel if no feedback provided
    }

    try {
      await updateDoc(doc(db, "modules", moduleId), { 
        status: newStatus,
        moderatorFeedback: feedback || "",
        moderatedAt: new Date()
      });
      alert(`Module ${newStatus}`);
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="p-5" style={{ backgroundColor: '#f9fafb', minHeight: '100vh', marginLeft: '250px' }}>
      <h2 className="fw-bold mb-4">Internal Moderation</h2>
      
      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h6 className="text-muted fw-bold small">PENDING REVIEWS</h6>
            <h2 className="fw-bold text-primary">{assignedModules.filter(m => m.status !== 'Approved').length}</h2>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h6 className="text-muted fw-bold small">COMPLETED</h6>
            <h2 className="fw-bold text-success">{assignedModules.filter(m => m.status === 'Approved').length}</h2>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <h5 className="fw-bold mb-4">Assigned Modules</h5>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light text-muted small">
              <tr>
                <th>Module</th><th>Lecturer</th><th>Files</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedModules.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.code}</strong><br/>{m.name}</td>
                  <td>{m.ownerName}</td>
                  <td>{m.files?.length || 0} Files</td>
                  <td>
                    <span className={`badge ${m.status === 'Approved' ? 'bg-success' : 'bg-warning'}`}>
                      {m.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-dark" onClick={() => m.files?.[0] && window.open(m.files[0].url)}>View</button>
                      <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(m.id, 'Approved')}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(m.id, 'Needs Revision')}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignedModules.length === 0 && <p className="text-center mt-3 text-muted">No modules assigned yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;