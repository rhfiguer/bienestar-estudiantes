import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCYJIaePopohWDKBAAwiDo0jT44t1_c6Ew",
    authDomain: "bienestar-estudiantes.firebaseapp.com",
    projectId: "bienestar-estudiantes",
    storageBucket: "bienestar-estudiantes.firebasestorage.app",
    messagingSenderId: "1011635700320",
    appId: "1:1011635700320:web:9e9160da4d74c4bff97905"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const verifyContent = async () => {
    console.log('Verifying content in Firestore...');
    try {
        const querySnapshot = await getDocs(collection(db, 'content'));
        if (querySnapshot.empty) {
            console.log('No content found in "content" collection.');
        } else {
            console.log(`Found ${querySnapshot.size} documents:`);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`- ID: ${doc.id}`);
                console.log(`  Title: ${data.title}`);
                console.log(`  Type: ${data.type}`);
                console.log(`  Created At: ${data.createdAt}`);
                console.log('---');
            });
        }
    } catch (error) {
        console.error('Error fetching content:', error);
    }
};

verifyContent();
