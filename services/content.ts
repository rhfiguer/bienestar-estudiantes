import { ContentItem } from '@/constants/data';

// En web (Vercel) usa la propia /api/content — en nativo usa la variable de entorno como fallback
const BASE_URL = typeof window !== 'undefined'
    ? ''
    : (process.env.EXPO_PUBLIC_API_URL ?? '');

const API_URL = `${BASE_URL}/api/content`;

export const ContentService = {
    // Fetch all content
    getAllContent: async (): Promise<ContentItem[]> => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching content:', error);
            return [];
        }
    },

    // Fetch content by category
    getContentByCategory: async (category: string): Promise<ContentItem[]> => {
        try {
            const allContent = await ContentService.getAllContent();
            return allContent.filter(item => item.category === category);
        } catch (error) {
            console.error('Error fetching content by category:', error);
            return [];
        }
    },

    // Fetch single item
    getContentById: async (id: string): Promise<ContentItem | null> => {
        try {
            const allContent = await ContentService.getAllContent();
            return allContent.find(item => item.id === id) || null;
        } catch (error) {
            console.error('Error fetching content item:', error);
            return null;
        }
    }
};
