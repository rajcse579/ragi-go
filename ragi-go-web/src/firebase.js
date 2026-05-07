import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvT9GmdHMrbs84IVtNAVFdPQ7uPgATYzM",
  authDomain: "ragi-go.firebaseapp.com",
  projectId: "ragi-go",
  storageBucket: "ragi-go.firebasestorage.app",
  messagingSenderId: "507797259572",
  appId: "1:507797259572:web:772255f740b8b5f9809161",
  measurementId: "G-356TRELGF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in the app
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable local persistence or other auth settings if needed
auth.useDeviceLanguage();

export default app;
