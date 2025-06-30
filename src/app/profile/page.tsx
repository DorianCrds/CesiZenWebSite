// app/profile/page.tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <main className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mon profil</h1>

            <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                        <p className="text-gray-700 text-lg">
                            <span className="font-semibold">Prénom :</span> {user.firstname}
                        </p>
                        <p className="text-gray-700 text-lg">
                            <span className="font-semibold">Nom :</span> {user.lastname}
                        </p>
                        <p className="text-gray-700 text-lg">
                            <span className="font-semibold">Email :</span> {user.email}
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:text-right">
                        <p className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {user.role?.label || 'Utilisateur'}
                        </p>
                    </div>
                </div>

                <div className="text-gray-600 text-sm border-t pt-4">
                    <p><strong>Compte actif :</strong> {user.isActive ? 'Oui' : 'Non'}</p>
                    <p><strong>Créé le :</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    <p><strong>Dernière mise à jour :</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>
        </main>
    );
}
