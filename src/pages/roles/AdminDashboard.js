import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [allModules, setAllModules] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('modules'); // Options: 'modules', 'documents', 'lecturers'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time sync for Modules
    const unsubModules = onSnapshot(collection(db, "modules"), (snapshot) => {
      setAllModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time sync for Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => { unsubModules(); unsubUsers(); };
  }, []);

  // --- ROLE MANAGEMENT ACTION ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      alert("Role updated successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // --- ROBUST LECTURER CALCULATION ---
  // This identifies anyone who OWNS a module OR has the 'Lecturer' role
  const uniqueOwnerIds = [...new Set(allModules.map(m => m.ownerId))];
  const lecturersList = allUsers.filter(u => 
    uniqueOwnerIds.includes(u.id) || u.role === 'Lecturer'
  );

  // --- SEARCH FILTERS ---
  const filteredModules = allModules.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLecturers = lecturersList.filter(l => 
    l.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total files across all modules
  const totalFilesCount = allModules.reduce((acc, m) => acc + (m.files?.length || 0), 0);

  if (loading) return <div className="p-5 text-center"><div className="spinner-border"></div></div>;

  return (
    <div className="p-5" style={{ backgroundColor: '#f9fafb', minHeight: '100vh', marginLeft: '250px' }}>
      
      {/* HEADER & SEARCH BAR */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">System Compliance</h2>
        <input 
          type="text" 
          className="form-control w-25 shadow-sm border-0 rounded-3" 
          placeholder={`Search ${activeView}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* INTERACTIVE STAT CARDS */}
      <div className="row g-4 mb-5">
        <div className="col-md-4" onClick={() => setActiveView('modules')} style={{ cursor: 'pointer' }}>
          <div className={`card border-0 shadow-sm p-4 rounded-4 ${activeView === 'modules' ? 'bg-primary text-white' : 'bg-white'}`}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className={`small fw-bold mb-0 ${activeView === 'modules' ? 'text-white-50' : 'text-muted'}`}>TOTAL MODULES</p>
                <h2 className="fw-bold m-0">{allModules.length}</h2>
              </div>
              <div className="fs-1">📚</div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4" onClick={() => setActiveView('documents')} style={{ cursor: 'pointer' }}>
          <div className={`card border-0 shadow-sm p-4 rounded-4 ${activeView === 'documents' ? 'bg-primary text-white' : 'bg-white'}`}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className={`small fw-bold mb-0 ${activeView === 'documents' ? 'text-white-50' : 'text-muted'}`}>TOTAL DOCUMENTS</p>
                <h2 className="fw-bold m-0">{totalFilesCount}</h2>
              </div>
              <div className="fs-1">📄</div>
            </div>
          </div>
        </div>

        <div className="col-md-4" onClick={() => setActiveView('lecturers')} style={{ cursor: 'pointer' }}>
          <div className={`card border-0 shadow-sm p-4 rounded-4 ${activeView === 'lecturers' ? 'bg-primary text-white' : 'bg-white'}`}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className={`small fw-bold mb-0 ${activeView === 'lecturers' ? 'text-white-50' : 'text-muted'}`}>ACTIVE LECTURERS</p>
                <h2 className="fw-bold m-0">{lecturersList.length}</h2>
              </div>
              <div className="fs-1">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC REGISTRY TABLE */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-5">
        <h5 className="fw-bold mb-4">
          {activeView === 'modules' ? 'Module Registry' : activeView === 'documents' ? 'All System Files' : 'Lecturer Registry'}
        </h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light text-muted small">
              {activeView === 'lecturers' ? (
                <tr><th>Name</th><th>Email</th><th>Modules Owned</th></tr>
              ) : activeView === 'documents' ? (
                <tr><th>File Name</th><th>Module</th><th>Owner</th><th>Action</th></tr>
              ) : (
                <tr><th>Code</th><th>Module Name</th><th>Lecturer</th><th>Files Count</th></tr>
              )}
            </thead>
            <tbody>
              {/* VIEW: LECTURERS */}
              {activeView === 'lecturers' && filteredLecturers.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.displayName}</strong></td>
                  <td>{l.email}</td>
                  <td>{allModules.filter(m => m.ownerId === l.id).length} Modules</td>
                </tr>
              ))}

              {/* VIEW: DOCUMENTS */}
              {activeView === 'documents' && filteredModules.flatMap(m => 
                (m.files || []).map((f, i) => (
                  <tr key={`${m.id}-${i}`}>
                    <td className="fw-bold">{f.name}</td>
                    <td><span className="badge bg-light text-dark">{m.code}</span></td>
                    <td>{m.ownerName}</td>
                    <td><a href={f.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">View File</a></td>
                  </tr>
                ))
              )}

              {/* VIEW: MODULES */}
              {activeView === 'modules' && filteredModules.map(m => (
                <tr key={m.id}>
                  <td><span className="badge bg-dark text-white">{m.code}</span></td>
                  <td className="fw-bold">{m.name}</td>
                  <td>👤 {m.ownerName}</td>
                  <td>{m.files?.length || 0} Files</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER ROLE MANAGEMENT */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <h5 className="fw-bold mb-4">User Role Management</h5>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light text-muted small">
              <tr><th>User</th><th>Current Role</th><th>Update Role</th></tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.displayName}</strong><br/>
                    <span className="text-muted smaller">{u.email}</span>
                  </td>
                  <td><span className="badge bg-info-subtle text-info">{u.role}</span></td>
                  <td>
                    <select 
                      className="form-select form-select-sm w-auto"
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      defaultValue={u.role}
                    >
                      <option value="Lecturer">Lecturer</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Admin">Admin</option>
                      <option value="Examiner">Examiner</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;