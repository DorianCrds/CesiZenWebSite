'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useMenu } from '../MenuContext';

interface ContentBlock {
    id?: number;
    type: 'text' | 'image' | 'video';
    content: string;
    order: number;
}

interface PageData {
    title: string;
    slug: string;
    content: ContentBlock[];
}

export default function CreatePage() {
    const router = useRouter();
    const { token } = useAuth();
    const { refreshMenu } = useMenu();

    const [page, setPage] = useState<PageData>({
        title: '',
        slug: '',
        content: [],
    });

    const [saving, setSaving] = useState(false);

    const handleChange = (field: keyof PageData, value: string) => {
        setPage({ ...page, [field]: value });
    };

    const handleBlockChange = (index: number, field: keyof ContentBlock, value: string | number) => {
        const newContent = [...page.content];
        newContent[index] = { ...newContent[index], [field]: value };
        setPage({ ...page, content: newContent });
    };

    const handleAddBlock = () => {
        const newBlock: ContentBlock = {
            type: 'text',
            content: '',
            order: page.content.length + 1,
        };
        setPage({ ...page, content: [...page.content, newBlock] });
    };

    const handleRemoveBlock = (index: number) => {
        const newContent = [...page.content];
        newContent.splice(index, 1);
        newContent.forEach((b, i) => (b.order = i + 1));
        setPage({ ...page, content: newContent });
    };

    const handleSave = async () => {
        if (!token || !page.title || !page.slug) return;
        setSaving(true);

        try {
            const cleanSlug = page.slug.replace(/[^a-zA-Z0-9]/g, '');

            // 1. Créer la page
            const res = await fetch('http://localhost:4000/cesizen/api/v1/pages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: page.title,
                    slug: cleanSlug,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                alert('❌ Erreur lors de la création de la page :\n' + text);
                setSaving(false);
                return;
            }

            const createdPage = await res.json();

            // 2. Créer les blocs associés
            for (const block of page.content) {
                const blockPayload = {
                    type: block.type,
                    content: block.content,
                    order: block.order,
                    pageId: createdPage.id,
                };

                const blockRes = await fetch('http://localhost:4000/cesizen/api/v1/content-blocks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(blockPayload),
                });

                if (!blockRes.ok) {
                    const errorText = await blockRes.text();
                    alert('❌ Erreur lors de la création d’un bloc :\n' + errorText);
                    setSaving(false);
                    return;
                }
            }

            // 3. Créer le menu item associé
            const menuRes = await fetch('http://localhost:4000/cesizen/api/v1/menu-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    label: page.title,
                    slug: cleanSlug,
                    order: 1,
                    pageId: createdPage.id,
                    isPublic: true,
                    requiredRole: null,
                }),
            });

            if (!menuRes.ok) {
                const menuErr = await menuRes.text();
                alert('❌ Erreur lors de la création du menu :\n' + menuErr);
                setSaving(false);
                return;
            }

            await refreshMenu(); // 👈 rafraîchissement du menu global

            alert('✅ Page, blocs et menu créés avec succès');
            router.push('/admin/content');
        } catch (error) {
            console.error('Erreur réseau :', error);
            alert('❌ Erreur réseau');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-4">Créer une nouvelle page</h1>

            <div className="mb-4">
                <label className="block font-semibold">Titre</label>
                <input
                    className="w-full border px-3 py-2 rounded"
                    value={page.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    disabled={saving}
                />
            </div>

            <div className="mb-4">
                <label className="block font-semibold">Slug</label>
                <input
                    className="w-full border px-3 py-2 rounded"
                    value={page.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    disabled={saving}
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
                                disabled={saving}
                            >
                                <option value="text">Texte</option>
                                <option value="image">Image</option>
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
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Contenu</label>
                        {block.type === 'text' ? (
                            <textarea
                                className="w-full border px-2 py-2 rounded"
                                rows={4}
                                value={block.content}
                                onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                                disabled={saving}
                            />
                        ) : (
                            <>
                                <input
                                    className="w-full border px-2 py-1 rounded mb-2"
                                    placeholder="URL de l'image"
                                    value={block.content}
                                    onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                                    disabled={saving}
                                />
                                {block.content && (
                                    <img
                                        src={block.content}
                                        alt={`Bloc image ${index + 1}`}
                                        className="max-w-full rounded shadow border"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    <button
                        className="text-red-600 mt-2 text-sm"
                        onClick={() => handleRemoveBlock(index)}
                        disabled={saving}
                    >
                        Supprimer ce bloc
                    </button>
                </div>
            ))}

            <button
                className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded mb-6"
                onClick={handleAddBlock}
                disabled={saving}
            >
                ➕ Ajouter un bloc
            </button>

            <div className="flex justify-end">
                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    onClick={handleSave}
                    disabled={saving}
                >
                    📝 Créer la page
                </button>
            </div>
        </div>
    );
}
