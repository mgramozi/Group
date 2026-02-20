import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const ModuleList = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "modules"), where("ownerId", "==", user.uid));
    return onSnapshot(q, (snapshot) => {
      setModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  return (
    <div className="main-content">
      <h2 className="welcome-header mb-4">All My Modules</h2>
      <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Module Name</th>
              <th>Files Uploaded</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.id}>
                <td><span className="badge bg-light text-dark">{m.code}</span></td>
                <td className="fw-bold">{m.name}</td>
                <td>{m.files?.length || 0} files</td>
                <td><span className={`badge ${m.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>{m.status || 'Pending'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModuleList;

