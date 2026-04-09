/**
 * Firebase Configuration — TENET5 Accountability Platform
 * Uses Firebase Auth (Google + Twitter/X) + Cloud Firestore for chat/comments.
 * All client-side — works on GitHub Pages with zero backend.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, TwitterAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "tenet5-accountability.firebaseapp.com",
  projectId: "tenet5-accountability",
  storageBucket: "tenet5-accountability.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

function isConfigured() { return firebaseConfig.apiKey !== "PLACEHOLDER_API_KEY"; }

export {
  app, auth, db, googleProvider, twitterProvider,
  signInWithPopup, signOut, onAuthStateChanged,
  collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp,
  doc, setDoc, getDoc, isConfigured
};
