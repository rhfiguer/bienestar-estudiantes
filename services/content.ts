import { ContentItem } from '@/constants/data';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

const CONTENT_COLLECTION = 'content';

export const ContentService = {
    // Fetch all content
    getAllContent: async (): Promise<ContentItem[]> => {
        try {
            const q = query(collection(db, CONTENT_COLLECTION), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ContentItem));
        } catch (error) {
            console.error('Error fetching content:', error);
            return [];
        }
    },

    // Fetch content by category
    getContentByCategory: async (category: string): Promise<ContentItem[]> => {
        try {
            const q = query(
                collection(db, CONTENT_COLLECTION),
                where('category', '==', category),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ContentItem));
        } catch (error) {
            console.error('Error fetching content by category:', error);
            return [];
        }
    },

    // Fetch single item
    getContentById: async (id: string): Promise<ContentItem | null> => {
        try {
            const docRef = doc(db, CONTENT_COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as ContentItem;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching content item:', error);
            return null;
        }
    },

    // Upload file to storage
    uploadFile: async (uri: string, path: string): Promise<string> => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Add new content item
    addContent: async (item: Omit<ContentItem, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, CONTENT_COLLECTION), {
                ...item,
                createdAt: new Date().toISOString()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding content:', error);
            throw error;
        }
    }
};
