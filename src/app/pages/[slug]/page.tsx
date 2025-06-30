import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

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

export default async function Page({ params }: { params: { slug: string } }) {
    const cookieStore = await cookies();
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
        <main className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-6">{page.title}</h1>

            {page.content
                .sort((a, b) => a.order - b.order)
                .map((block) => {
                    switch (block.type) {
                        case 'text':
                            return (
                                <div
                                    key={block.id}
                                    className="prose prose-lg mb-6"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                />
                            );
                        case 'image':
                            return (
                                <div key={block.id} className="mb-6">
                                    <img src={block.content} alt="" className="rounded-xl shadow-md" />
                                </div>
                            );
                        case 'video':
                            return (
                                <div key={block.id} className="mb-6">
                                    <iframe
                                        src={block.content}
                                        className="w-full aspect-video rounded-xl"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
        </main>
    );
}
