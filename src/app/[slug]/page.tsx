'use client';

import { use, useEffect, useState } from 'react';

interface ContentItem {
    id: number;
    type: string;
    content: string;
    order: number;
}

interface PageData {
    id: number;
    title: string;
    slug: string;
    content: ContentItem[];
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
    const paramsResolved = use(params);
    const slug = paramsResolved.slug;

    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPage() {
            try {
                const res = await fetch(`http://localhost:4000/cesizen/api/v1/public-pages/${slug}`);
                if (!res.ok) throw new Error('Erreur lors de la récupération');
                const data = await res.json();
                setPage(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchPage();
    }, [slug]);

    if (loading) return <p className="text-center text-gray-500">Chargement...</p>;
    if (!page) return <p className="text-center text-red-500">Page introuvable</p>;

    return (
        <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-center mb-12 text-blue-700 tracking-tight">
                {page.title}
            </h1>

            <div className="space-y-14">
                {page.content.map((block) => {
                    switch (block.type) {
                        case 'text':
                            return (
                                <section
                                    key={block.id}
                                    className="text-base text-gray-700 leading-relaxed space-y-4"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                />
                            );
                        case 'image':
                            return (
                                <div key={block.id} className="flex justify-center">
                                    <img
                                        src={block.content}
                                        alt=""
                                        className="rounded-2xl shadow-lg max-w-4xl w-full h-auto object-cover transition duration-300 hover:scale-105"
                                    />
                                </div>
                            );

                        case 'video':
                            return (
                                <div key={block.id} className="relative overflow-hidden rounded-2xl shadow-lg max-w-4xl mx-auto aspect-video">
                                    <iframe
                                        src={block.content}
                                        className="absolute inset-0 w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            );

                        default:
                            return null;
                    }
                })}
            </div>
        </main>
    );
}
