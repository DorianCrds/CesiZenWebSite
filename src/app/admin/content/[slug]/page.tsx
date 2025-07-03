'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface ContentBlock {
    id?: number;
    type: 'text' | 'image' | 'video';
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
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const { token } = useAuth();

    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [originalSlug, setOriginalSlug] = useState<string>(slug);

    useEffect(() => {
        if (!token || !slug) return;

        const fetchPage = async () => {
            try {
                const res = await fetch(`http://localhost:4000/cesizen/api/v1/pages/${slug}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Page non trouvée');
                const data = await res.json();
                setPage(data);
                setOriginalSlug(data.slug);
            } catch (error) {
                console.error('Erreur lors du chargement :', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug, token]);

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
        newContent.forEach((b, i) => (b.order = i + 1));
        setPage({ ...page, content: newContent });
    };

    const handleSave = async () => {
        if (!token || !page) return;
        setSaving(true);

        try {
            const cleanSlug = page.slug.replace(/[^a-zA-Z0-9]/g, '');

            // 1. Mettre à jour la page avec originalSlug dans l'URL
            const pageRes = await fetch(`http://localhost:4000/cesizen/api/v1/pages/${originalSlug}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: page.title,
                    slug: cleanSlug,
                }),
            });

            if (!pageRes.ok) {
                const text = await pageRes.text();
                alert('❌ Erreur lors de la mise à jour de la page :\n' + text);
                setSaving(false);
                return;
            }

            // Mise à jour du slug original en cas de changement
            setOriginalSlug(cleanSlug);

            // 2. Récupérer les anciens blocs en DB
            const existingRes = await fetch(`http://localhost:4000/cesizen/api/v1/pages/${cleanSlug}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const existingData = await existingRes.json();
            const existingBlockIds = (existingData.content || []).map((b: ContentBlock) => b.id);

            const currentBlockIds = page.content.map((b) => b.id).filter(Boolean);
            const blocksToDelete = existingBlockIds.filter((id: number | undefined) => !currentBlockIds.includes(id));

            // 3. Supprimer les anciens blocs retirés
            for (const id of blocksToDelete) {
                const deleteRes = await fetch(`http://localhost:4000/cesizen/api/v1/content-blocks/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!deleteRes.ok) {
                    const errText = await deleteRes.text();
                    console.warn(`Erreur suppression bloc #${id}:`, errText);
                }
            }

            // 4. Enregistrer les blocs restants
            for (const block of page.content) {
                const blockPayload = {
                    type: block.type,
                    content: block.content,
                    order: block.order,
                    pageId: page.id,
                };

                const blockUrl = block.id
                    ? `http://localhost:4000/cesizen/api/v1/content-blocks/${block.id}`
                    : `http://localhost:4000/cesizen/api/v1/content-blocks`;

                const method = block.id ? 'PUT' : 'POST';

                const res = await fetch(blockUrl, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(blockPayload),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`Erreur bloc ${block.id || '[nouveau]'}`, errorText);
                    alert('❌ Erreur lors de la mise à jour d’un bloc :\n' + errorText);
                    setSaving(false);
                    return;
                }
            }

            alert('✅ Page et blocs mis à jour');
            router.push('/admin/content');
        } catch (error) {
            console.error('Erreur réseau :', error);
            alert('❌ Erreur réseau');
        } finally {
            setSaving(false);
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

            {page.content?.map((block, index) => (
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
                    💾 Enregistrer
                </button>
            </div>
        </div>
    );
}
