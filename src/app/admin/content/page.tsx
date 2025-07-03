'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

interface ContentBlock {
    id: number;
    type: string;
    order: number;
    content: string;
}

interface Page {
    id: number;
    title: string;
    slug: string;
    content: ContentBlock[];
}

export default function ContentAdminPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const { token } = useAuth();

    const fetchPages = async () => {
        const res = await fetch('http://localhost:4000/cesizen/api/v1/pages', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        setPages(data);
    };

    useEffect(() => {
        if (token) fetchPages();
    }, [token]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Gestion du contenu des pages</h1>
            {pages.length === 0 ? (
                <p>Aucune page trouvée.</p>
            ) : (
                <div className="space-y-6">
                    {pages.map((page) => (
                        <div key={page.id} className="border border-gray-300 rounded p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">{page.title}</h2>
                                    <p className="text-sm text-gray-500">Slug : {page.slug}</p>
                                </div>
                                <Link
                                    href={`/admin/content/${page.slug}`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Modifier
                                </Link>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-md font-medium mb-2">Blocs de contenu :</h3>
                                {page.content.length === 0 ? (
                                    <p className="text-gray-400">Aucun bloc de contenu.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {page.content
                                            .sort((a, b) => a.order - b.order)
                                            .map((block) => (
                                                <li
                                                    key={block.id}
                                                    className="bg-gray-100 p-3 rounded border"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-semibold">
                                                            [{block.order}] {block.type}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700 mt-2">
                                                        {block.content.length > 120
                                                            ? block.content.slice(0, 120) + '...'
                                                            : block.content}
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
