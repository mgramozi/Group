import React, { useState } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const FileUpload = ({ moduleId, onComplete }) => {
  const [file, setFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  // RE-VERIFY: Ensure this matches your "Web App URL" from Google Apps Script deployment
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyAROyQs4toY-o70Qms3rDwFWWHUd8eGMadjN7dKclMd-nN4umHL5XvjMRfB2aq4ysOxg/exec";

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !customFileName) {
      alert("Please select a file and enter a name.");
      return;
    }
    
    setUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      
      const payload = {
        base64: base64,
        filename: customFileName, 
        mimetype: file.type
      };

      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        
        const result = await response.json();

        if (result.status === "success") {
          const moduleRef = doc(db, "modules", moduleId);
          
          // UPDATED LOGIC: Resetting status for the Moderator
          await updateDoc(moduleRef, {
            // Automatically flags the module for the moderator to check again
            status: "Pending Review",
            
            // Clears previous rejection messages so the UI stays clean
            moderatorFeedback: "", 

            // Logic to track "Assessment" for the Two-Assessment Rule
            uploadedDocs: arrayUnion(customFileName.toLowerCase().includes('assessment') ? 'Assessment' : 'Other'),
            
            // Adds the new file details to the files array
            files: arrayUnion({ 
              name: customFileName, 
              url: result.url, 
              date: new Date().toISOString() 
            })
          });

          alert("Successfully uploaded to Google Drive and status updated!");
          onComplete(); // Closes the modal or refreshes the UI
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Upload Error:", err);
        alert("Upload failed. Check console (F12) for details.");
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <form onSubmit={handleUpload} className="p-3 bg-light rounded-4">
      <div className="mb-3">
        <label className="small fw-bold mb-1">File Name (e.g., "Week 1 Notes")</label>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Enter file name..."
          value={customFileName}
          onChange={(e) => setCustomFileName(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-3">
        <label className="small fw-bold mb-1">Choose File</label>
        <input 
          type="file" 
          className="form-control" 
          onChange={(e) => setFile(e.target.files[0])} 
          required
        />
      </div>
      
      <button type="submit" disabled={uploading} className="btn btn-dark w-100 rounded-3">
        {uploading ? 'Uploading to Drive...' : 'Confirm Upload'}
      </button>
    </form>
  );
};

export default FileUpload;