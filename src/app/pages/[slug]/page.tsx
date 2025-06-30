import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Metadata } from 'next';

type ContentBlock = {
    id: number;
    type: string;
    content: string;
    order: number;
};

type PageData = {
    title: string;
    content: ContentBlock[];
};

export const metadata: Metadata = {
    title: 'CesiZen - Page',
    description: 'Contenu de la page dynamique',
};

export default async function Page({ params }: { params: { slug: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    const res = await fetchWithAuth(
        `http://localhost:4000/cesizen/api/v1/pages/${params.slug}`,
        token
    );

    if (!res.ok) return notFound();

    const page: PageData = await res.json();

    return (
        <main className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold text-center mb-10 text-blue-700">
                {page.title}
            </h1>

            <div className="space-y-10">
                {page.content
                    .sort((a, b) => a.order - b.order)
                    .map((block) => {
                        switch (block.type) {
                            case 'text':
                                return (
                                    <article
                                        key={block.id}
                                        className="prose prose-lg prose-blue max-w-none mx-auto"
                                        dangerouslySetInnerHTML={{ __html: block.content }}
                                    />
                                );

                            case 'image':
                                return (
                                    <div key={block.id} className="flex justify-center">
                                        <img
                                            src={block.content}
                                            alt=""
                                            className="rounded-xl shadow-lg w-full max-w-2xl object-cover"
                                        />
                                    </div>
                                );

                            case 'video':
                                return (
                                    <div key={block.id} className="aspect-video max-w-3xl mx-auto">
                                        <iframe
                                            src={block.content}
                                            className="w-full h-full rounded-xl shadow-md"
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
