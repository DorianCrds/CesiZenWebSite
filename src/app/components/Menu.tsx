'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type RoleLabel = 'super-admin' | 'admin' | 'user';

interface MenuItem {
    id: number;
    label: string;
    slug: string;
    requiredRole?: RoleLabel | number | null;
}

export default function NavigationMenu() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const { user, logout, token } = useAuth();

    const userRole = user?.role?.label || null;

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const endpoint = user && token
                    ? 'http://localhost:4000/cesizen/api/v1/menu-items'
                    : 'http://localhost:4000/cesizen/api/v1/public-menu';

                const res = await fetch(endpoint, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!res.ok) {
                    console.error('Erreur lors du chargement du menu');
                    return;
                }

                const data = await res.json();
                setMenuItems(data);
            } catch (error) {
                console.error('Erreur réseau lors de la récupération du menu :', error);
            }
        };

        fetchMenu();
    }, [user, token]);

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

        const roleMap: Record<number, string> = {
            1: 'super-admin',
            2: 'admin',
            3: 'user',
        };

        const itemRequiredRoleLabel =
            typeof item.requiredRole === 'string'
                ? item.requiredRole
                : roleMap[item.requiredRole] ?? null;

        return (
            itemRequiredRoleLabel &&
            rolePriority(userRole) >= rolePriority(itemRequiredRoleLabel)
        );
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
                    <Link href="/a-propos" className="text-gray-700 hover:text-blue-600">
                        À propos
                    </Link>
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
