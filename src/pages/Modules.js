import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayRemove, collection, query, where, onSnapshot } from 'firebase/firestore'; // Added updateDoc, arrayRemove
import { useAuth } from '../context/AuthContext';

const Modules = () => {
  const { user, userData } = useAuth();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = userData?.role === 'Admin' 
      ? collection(db, "modules") 
      : query(collection(db, "modules"), where("ownerId", "==", user.uid));

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(docs);
      // Sync the selected module if it's currently being viewed
      if (selectedModule) {
        const updated = docs.find(m => m.id === selectedModule.id);
        setSelectedModule(updated);
      }
    });
  }, [user, userData, selectedModule?.id]);

  // NEW: Function to delete a specific file
  const handleDeleteFile = async (fileObject) => {
    if (window.confirm(`Delete "${fileObject.name}"?`)) {
      try {
        const moduleRef = doc(db, "modules", selectedModule.id);
        await updateDoc(moduleRef, {
          files: arrayRemove(fileObject),
          // Also remove from the tracking array used for counts
          uploadedDocs: arrayRemove(fileObject.name.toLowerCase().includes('assessment') ? 'Assessment' : 'Document')
        });
      } catch (err) {
        alert("Error removing file: " + err.message);
      }
    }
  };

  return (
    <div className="p-5">
      <h2 className="fw-bold mb-4">Modules</h2>
      <div className="row g-4">
        {modules.map(m => (
          <div key={m.id} className="col-md-4" onClick={() => setSelectedModule(m)} style={{ cursor: 'pointer' }}>
            <div className={`card h-100 border-0 shadow-sm p-4 rounded-4 bg-white ${selectedModule?.id === m.id ? 'border border-dark' : ''}`}>
              <span className="badge bg-light text-dark mb-2 w-25">{m.code}</span>
              <h5 className="fw-bold">{m.name}</h5>
              <p className="text-muted small">{m.files?.length || 0} Files</p>
            </div>
          </div>
        ))}
      </div>

      {selectedModule && (
        <div className="mt-5 p-4 bg-white rounded-4 shadow-sm border">
          <h4 className="fw-bold mb-4">Files for {selectedModule.name}</h4>
          <div className="list-group list-group-flush">
            {selectedModule.files?.map((file, idx) => (
              <div key={idx} className="list-group-item d-flex justify-content-between align-items-center bg-light mb-2 rounded-3 border-0">
                <a href={file.url} target="_blank" rel="noreferrer" className="text-decoration-none text-dark fw-bold">
                  📄 {file.name}
                </a>
                <button 
                  className="btn btn-sm btn-outline-danger border-0" 
                  onClick={() => handleDeleteFile(file)}
                >
                  🗑️ Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;