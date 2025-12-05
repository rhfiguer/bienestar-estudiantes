// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCYJIaePopohWDKBAAwiDo0jT44t1_c6Ew",
    authDomain: "bienestar-estudiantes.firebaseapp.com",
    projectId: "bienestar-estudiantes",
    storageBucket: "bienestar-estudiantes.firebasestorage.app",
    messagingSenderId: "1011635700320",
    appId: "1:1011635700320:web:9e9160da4d74c4bff97905"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
