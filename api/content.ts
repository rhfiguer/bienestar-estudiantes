import { neon } from '@neondatabase/serverless';

export default async function handler(_req: Request): Promise<Response> {
    try {
        if (!process.env.DATABASE_URL) {
            return new Response(JSON.stringify({ error: 'DATABASE_URL not set' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const sql = neon(process.env.DATABASE_URL);

        const rows = await sql`
            SELECT
                id,
                topic,
                "publicTitle",
                author,
                "videoUrl",
                "audioUrl",
                category,
                "coverUrl",
                duration,
                "publicDescription",
                script,
                article,
                "createdAt"
            FROM "ProductionQueue"
            WHERE status IN ('COMPLETED', 'PUBLISHED')
            ORDER BY "createdAt" DESC
        `;

        const formatted = rows.map((item: any) => ({
            id: item.id,
            title: item.publicTitle || item.topic,
            author: item.author || 'AI Guide',
            type: item.videoUrl ? 'video' : 'audio',
            category: item.category || 'Bienestar General',
            imageUrl: item.coverUrl || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80',
            duration: item.duration || '05:00',
            contentUrl: item.videoUrl || item.audioUrl,
            body: item.publicDescription || 'Contenido generado por IA para tu bienestar.',
            script: item.script,
            article: item.article || null,
            createdAt: item.createdAt,
        }));

        return new Response(JSON.stringify(formatted), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
