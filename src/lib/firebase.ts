import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkgs-3jXIGGKRiX-jbKc3HXdoLQVLTyAI",
  authDomain: "mediai-4b446.firebaseapp.com",
  projectId: "mediai-4b446",
  storageBucket: "mediai-4b446.firebasestorage.app",
  messagingSenderId: "457091631207",
  appId: "1:457091631207:web:dd49e157c36730a20facc2",
  measurementId: "G-GZJ8FEXQHE",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
