export type ContentType = 'audio' | 'video' | 'text';

export interface ContentItem {
    id: string;
    title: string;
    author: string;
    type: ContentType;
    category: string;
    imageUrl: string;
    duration?: string; // For audio/video
    contentUrl?: string; // For audio/video
    body?: string; // For text
}


