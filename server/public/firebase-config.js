// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQZyrujTqWH7eTjmNdVkck90qJiQGjruU",
  authDomain: "youversion-internship.firebaseapp.com",
  projectId: "youversion-internship",
  storageBucket: "youversion-internship.firebasestorage.app",
  messagingSenderId: "584901683310",
  appId: "1:584901683310:web:05bdd66749dffbc9ef1e7f",
  measurementId: "G-JCLTRX9BKE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 