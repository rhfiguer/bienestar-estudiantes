export type ContentType = 'audio' | 'video';

export interface ContentItem {
    id: string;
    title: string;
    author: string;
    type: ContentType;
    category: string;
    imageUrl: string;
    duration: string;
    contentUrl: string;
    body: string;
    script?: string;
    createdAt: string;
}


