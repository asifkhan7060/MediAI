import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCEcBkZG_Vw2_Q33X1BmOtFKa4Xz2uNK_c",
  authDomain: "mediai-6bd85.firebaseapp.com",
  projectId: "mediai-6bd85",
  storageBucket: "mediai-6bd85.firebasestorage.app",
  messagingSenderId: "1391724626",
  appId: "1:1391724626:web:28588548a4eaf7f9c5b78b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
