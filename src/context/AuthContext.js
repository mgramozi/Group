import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Clean up any existing document listener if the user logs out or changes
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (currentUser) {
        // Reference to the user's document in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        
        // Listen for real-time updates to the user's role and data
        unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            // New user detected: they have no document in Firestore yet
            setUserData({ isNewUser: true });
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore Listener Error:", error);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // Function to save the chosen role during the first sign-up
  const updateUserRole = async (role) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: role, 
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const value = {
    user,
    userData,
    updateUserRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};