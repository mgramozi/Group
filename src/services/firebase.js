import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsOb6csBCnbaMfl7pkR12pUHSafhQ03L4",
  authDomain: "cams-e8a6a.firebaseapp.com",
  projectId: "cams-e8a6a",
  storageBucket: "cams-e8a6a.firebasestorage.app",
  messagingSenderId: "673617451635",
  appId: "1:673617451635:web:ae9b0d696e308c67e6a806",
  measurementId: "G-GLJNL07RKW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;