// app/admin/layout.tsx
import Link from 'next/link';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-100 p-4 shadow">
                <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
                <nav className="space-y-2">
                    <Link href="/admin/users" className="block text-blue-600 hover:underline">Gestion des utilisateurs</Link>
                    <Link href="/admin/content" className="block text-blue-600 hover:underline">Gestion du contenu</Link>
                    <Link href="/admin/questionnaire" className="block text-blue-600 hover:underline">Questionnaire</Link>
                </nav>
            </aside>
            <main className="flex-1 p-6 bg-white">{children}</main>
        </div>
    );
}
