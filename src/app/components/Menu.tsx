// app/components/Menu.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
    id: number;
    label: string;
    slug: string;
    requiredRole?: string | null;
}

export default function NavigationMenu() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const { user, logout } = useAuth();

    const userRole = user?.role?.label || null;

    useEffect(() => {
        const fetchMenu = async () => {
            const res = await fetch('http://localhost:4000/cesizen/api/v1/public-menu');
            const data = await res.json();
            setMenuItems(data);
        };
        fetchMenu();
    }, []);

    const rolePriority = (role: string) => {
        const levels: Record<string, number> = {
            user: 1,
            admin: 2,
            'super-admin': 3,
        };
        return levels[role] ?? 0;
    };

    const filteredMenuItems = menuItems.filter((item) => {
        if (!item.requiredRole) return true;
        if (!userRole) return false;
        return rolePriority(userRole) >= rolePriority(item.requiredRole);
    });

    return (
        <nav className="bg-white shadow px-4 py-3 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">CesiZen</Link>
                <div className="flex space-x-6 items-center">
                    {filteredMenuItems.map((item) => (
                        <Link key={item.id} href={`/${item.slug}`} className="text-gray-700 hover:text-blue-600">
                            {item.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <Link href="/profile" className="text-gray-700 hover:text-blue-600">Mon profil</Link>
                            <button onClick={logout} className="text-red-500 hover:text-red-600">Déconnexion</button>
                        </>
                    ) : (
                        <Link href="/login" className="text-blue-600 hover:text-blue-700">Connexion</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
