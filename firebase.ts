import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWb4JLc7-L7jwrSuObafmqqK3rMYzaiZs",
  authDomain: "guru-93d1e.firebaseapp.com",
  projectId: "guru-93d1e",
  storageBucket: "guru-93d1e.appspot.com",
  messagingSenderId: "674240389013",
  appId: "1:674240389013:web:cb82a55f17bb28d0ba209c",
  measurementId: "G-EBTCZ8DWJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();