'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface ContentBlock {
    id?: number;
    type: string;
    content: string;
    order: number;
}

interface PageData {
    id: number;
    title: string;
    slug: string;
    content: ContentBlock[];
}

export default function EditPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !id) return;
        const fetchPage = async () => {
            const res = await fetch(`http://localhost:4000/cesizen/api/v1/pages/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setPage(data);
            setLoading(false);
        };
        fetchPage();
    }, [id, token]);

    const handleChange = (field: keyof PageData, value: string) => {
        if (!page) return;
        setPage({ ...page, [field]: value });
    };

    const handleBlockChange = (index: number, field: keyof ContentBlock, value: string | number) => {
        if (!page) return;
        const newContent = [...page.content];
        newContent[index] = { ...newContent[index], [field]: value };
        setPage({ ...page, content: newContent });
    };

    const handleAddBlock = () => {
        if (!page) return;
        const newBlock: ContentBlock = {
            type: 'text',
            content: '',
            order: page.content.length + 1,
        };
        setPage({ ...page, content: [...page.content, newBlock] });
    };

    const handleRemoveBlock = (index: number) => {
        if (!page) return;
        const newContent = [...page.content];
        newContent.splice(index, 1);
        // Reordonner
        newContent.forEach((b, i) => (b.order = i + 1));
        setPage({ ...page, content: newContent });
    };

    const handleSave = async () => {
        if (!token || !page) return;
        const res = await fetch(`http://localhost:4000/cesizen/api/v1/pages/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(page),
        });

        if (res.ok) {
            alert('Page mise à jour');
            router.push('/admin/content');
        } else {
            alert('Erreur lors de la mise à jour');
        }
    };

    if (loading || !page) return <div>Chargement...</div>;

    return (
        <div className="max-w-3xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-4">Modifier la page</h1>

            <div className="mb-4">
                <label className="block font-semibold">Titre</label>
                <input
                    className="w-full border px-3 py-2 rounded"
                    value={page.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block font-semibold">Slug</label>
                <input
                    className="w-full border px-3 py-2 rounded"
                    value={page.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                />
            </div>

            <h2 className="text-lg font-semibold mb-2">Blocs de contenu</h2>

            {page.content.map((block, index) => (
                <div key={index} className="border rounded p-4 mb-4 bg-gray-50">
                    <div className="flex gap-4 mb-2">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold">Type</label>
                            <select
                                className="w-full border px-2 py-1 rounded"
                                value={block.type}
                                onChange={(e) => handleBlockChange(index, 'type', e.target.value)}
                            >
                                <option value="text">Texte</option>
                                <option value="image">Image</option>
                                <option value="video">Vidéo</option>
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-semibold">Ordre</label>
                            <input
                                type="number"
                                className="w-full border px-2 py-1 rounded"
                                value={block.order}
                                onChange={(e) =>
                                    handleBlockChange(index, 'order', parseInt(e.target.value) || 0)
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Contenu</label>
                        <textarea
                            className="w-full border px-2 py-2 rounded"
                            rows={4}
                            value={block.content}
                            onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                        />
                    </div>
                    <button
                        className="text-red-600 mt-2"
                        onClick={() => handleRemoveBlock(index)}
                    >
                        Supprimer ce bloc
                    </button>
                </div>
            ))}

            <button
                className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded mb-6"
                onClick={handleAddBlock}
            >
                ➕ Ajouter un bloc
            </button>

            <div className="flex justify-end">
                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    onClick={handleSave}
                >
                    💾 Enregistrer
                </button>
            </div>
        </div>
    );
}
