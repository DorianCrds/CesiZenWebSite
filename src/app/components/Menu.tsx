'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/app/admin/content/MenuContext'; // 👈

type RoleLabel = 'super-admin' | 'admin' | 'user';

export default function NavigationMenu() {
    const { items: menuItems } = useMenu(); // 👈 récupération du menu via le contexte
    const { user, logout } = useAuth();
    const router = useRouter();

    const userRole = user?.role?.label || null;

    const rolePriority = (role: string) => {
        const levels: Record<string, number> = {
            user: 1,
            admin: 2,
            'super-admin': 3,
        };
        return levels[role] ?? 0;
    };

    const filteredMenuItems = Array.isArray(menuItems)
        ? menuItems.filter((item) => {
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
        })
        : []; // 👈 sécurité en cas de format inattendu

    const handleLogout = () => {
        logout();
        router.push('/');
    };

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
                    {userRole && rolePriority(userRole) >= rolePriority('admin') && (
                        <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                            Administration
                        </Link>
                    )}
                    {user ? (
                        <>
                            <Link href="/profile" className="text-gray-700 hover:text-blue-600">Mon profil</Link>
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-600">Déconnexion</button>
                        </>
                    ) : (
                        <Link href="/login" className="text-blue-600 hover:text-blue-700">Connexion</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
