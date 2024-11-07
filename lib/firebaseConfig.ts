// lib/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD9Ro2uCJ_KwvXxSXcc_s9uhLS7P6sOAMw",
    authDomain: "sample-f41d0.firebaseapp.com",
    projectId: "sample-f41d0",
    storageBucket: "sample-f41d0.firebasestorage.app",
    messagingSenderId: "248132997541",
    appId: "1:248132997541:web:8f50a90b6377dd05aed84c",
    measurementId: "G-Z8TETCGV61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
