import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; 
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore'; 
import { useAuth } from '../../context/AuthContext'; 
import FileUpload from '../../components/FileUpload'; 
import { useNavigate } from 'react-router-dom';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', code: '', program: '' });

  // 1. Real-time Firebase Sync
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "modules"), where("ownerId", "==", user.uid));
    return onSnapshot(q, (snapshot) => {
      setModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  // 2. Delete Functionality
  const handleDeleteModule = async (moduleId, moduleName) => {
    if (window.confirm(`Are you sure you want to delete "${moduleName}"?`)) {
      try {
        await deleteDoc(doc(db, "modules", moduleId));
      } catch (err) { alert("Error: " + err.message); }
    }
  };

  // 3. Create Functionality
  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "modules"), {
        ...newModule,
        ownerId: user.uid,
        ownerName: user.displayName,
        status: 'Pending',
        files: [],
        createdAt: new Date()
      });
      setShowCreateModal(false);
      setNewModule({ name: '', code: '', program: '' });
    } catch (err) { alert("Error: " + err.message); }
  };

  return (
    <div className="main-content">
      {/* Header Section */}
      <h1 className="welcome-header display-4">Welcome, {user?.displayName?.split(' ')[0]}</h1>
      <p className="text-muted mb-5">Manage your modules and upload course documents</p>

      {/* Stats Cards Section */}
      <div className="row mb-5 g-4">
        <div className="col-md-6 col-lg-4" onClick={() => navigate('/modules')} style={{ cursor: 'pointer' }}>
          <div className="stat-box shadow-sm">
            <div>
              <p className="text-muted smaller fw-bold mb-0 uppercase">My Modules</p>
              <h2 className="fw-bold m-0">{modules.length}</h2>
            </div>
            <div className="icon-box-green">📁</div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-4" onClick={() => navigate('/modules')} style={{ cursor: 'pointer' }}>
          <div className="stat-box shadow-sm">
            <div>
              <p className="text-muted smaller fw-bold mb-0 uppercase">My Documents</p>
              <h2 className="fw-bold m-0">{modules.reduce((acc, m) => acc + (m.files?.length || 0), 0)}</h2>
            </div>
            <div className="icon-box-blue">📄</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Modules Display Area */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h5 className="fw-bold mb-4">Recent Modules</h5>
            <div className="row g-3">
              {modules.length === 0 ? (
                <div className="text-center py-4 text-muted">No modules created yet.</div>
              ) : (
                modules.map(m => (
                  <div key={m.id} className="col-md-6">
                    <div className="module-card d-flex flex-column h-100 p-3 border rounded-4 position-relative">
                      {/* Delete Button */}
                      <button 
                        className="btn btn-sm position-absolute end-0 top-0 m-2 border-0" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(m.id, m.name); }}
                        style={{ background: 'transparent' }}
                      >
                        🗑️
                      </button>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-light text-dark">{m.code}</span>
                        <span className={`badge ${m.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {m.status || 'Pending'}
                        </span>
                      </div>
                      
                      <h6 className="fw-bold mb-1">{m.name}</h6>
                      <p className="text-muted smaller mb-2">{m.program}</p>
                      
                      {/* Feedback Display if Moderator rejected something */}
                      {m.moderatorFeedback && (
                        <p className="text-danger smaller mt-1 mb-2">⚠️ {m.moderatorFeedback}</p>
                      )}
                      
                      <button 
                        onClick={() => setSelectedModule(m)} 
                        className="btn btn-outline-dark btn-sm w-100 rounded-3 mt-auto"
                      >
                        Upload Documents
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions Area */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h5 className="fw-bold mb-4">Quick Actions</h5>
            <div className="quick-action-item" onClick={() => setShowCreateModal(true)}>
              📁 <span className="ms-3">Create New Module</span>
            </div>
            <div className="quick-action-item" onClick={() => navigate('/modules')}>
              📖 <span className="ms-3">View All Modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Create Module Modal */}
      {showCreateModal && (
        <div className="modal d-block bg-dark bg-opacity-50 pt-5" style={{zIndex: 2000}}>
          <div className="modal-dialog">
            <form onSubmit={handleCreateModule} className="modal-content p-4 rounded-4 shadow-lg border-0">
               <div className="d-flex justify-content-between mb-3">
                 <h4 className="fw-bold m-0">New Module</h4>
                 <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
               </div>
               <div className="mb-2">
                 <label className="smaller text-muted fw-bold">MODULE CODE</label>
                 <input className="form-control" placeholder="e.g. CS101" required onChange={e => setNewModule({...newModule, code: e.target.value})} />
               </div>
               <div className="mb-2">
                 <label className="smaller text-muted fw-bold">MODULE NAME</label>
                 <input className="form-control" placeholder="e.g. Introduction to Programming" required onChange={e => setNewModule({...newModule, name: e.target.value})} />
               </div>
               <div className="mb-3">
                 <label className="smaller text-muted fw-bold">PROGRAM</label>
                 <input className="form-control" placeholder="e.g. Computer Science" required onChange={e => setNewModule({...newModule, program: e.target.value})} />
               </div>
               <button type="submit" className="btn btn-dark w-100 rounded-3 py-2">Create Module</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. File Upload Modal */}
      {selectedModule && (
        <div className="modal d-block bg-dark bg-opacity-50 pt-5" style={{zIndex: 2000}}>
          <div className="modal-dialog">
            <div className="modal-content p-4 rounded-4 shadow-lg border-0">
               <div className="d-flex justify-content-between mb-3">
                 <h4 className="fw-bold m-0">Upload: {selectedModule.name}</h4>
                 <button className="btn-close" onClick={() => setSelectedModule(null)}></button>
               </div>
               <FileUpload moduleId={selectedModule.id} onComplete={() => setSelectedModule(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;