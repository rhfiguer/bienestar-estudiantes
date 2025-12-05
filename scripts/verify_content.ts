import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
