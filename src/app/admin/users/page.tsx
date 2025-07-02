'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Role {
    id: number;
    label: string;
}

interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    isActive: boolean;
    role: Role;
}

export default function UsersAdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingIds, setLoadingIds] = useState<number[]>([]); // pour gérer les boutons en cours
    const { token, user } = useAuth();

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:4000/cesizen/api/v1/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error('Réponse inattendue pour /users :', data);
                setUsers([]);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des utilisateurs :', err);
            setUsers([]);
        }
    };

    const toggleActive = async (id: number, isActive: boolean) => {
        setLoadingIds((prev) => [...prev, id]);
        try {
            const res = await fetch(`http://localhost:4000/cesizen/api/v1/users/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !isActive }),
            });

            if (!res.ok) {
                throw new Error(`Erreur serveur: ${res.status}`);
            }

            // Mise à jour optimiste de l'état local
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.id === id ? { ...u, isActive: !isActive } : u
                )
            );
        } catch (err) {
            console.error('Erreur lors du changement d\'état utilisateur :', err);
            alert('Une erreur est survenue lors de la modification du statut utilisateur.');
        } finally {
            setLoadingIds((prev) => prev.filter((loadingId) => loadingId !== id));
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const isSuperAdmin = user?.role?.label === 'super-admin';

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
            <table className="w-full table-auto border">
                <thead>
                <tr className="bg-gray-200">
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>État</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {(Array.isArray(users) ? users : [])
                    .filter(u => isSuperAdmin || u.role.label === 'user')
                    .map(u => {
                        const isAdmin = u.role?.label === 'admin';
                        const canToggle = isSuperAdmin || (!isAdmin && u.role.label === 'user');
                        const isLoading = loadingIds.includes(u.id);

                        return (
                            <tr key={u.id} className="text-center border-t">
                                <td>{u.firstname} {u.lastname}</td>
                                <td>{u.email}</td>
                                <td>{u.role?.label}</td>
                                <td className={u.isActive ? "text-green-600" : "text-red-600"}>
                                    {u.isActive ? 'Actif' : 'Inactif'}
                                </td>
                                <td>
                                    {canToggle ? (
                                        <button
                                            onClick={() => toggleActive(u.id, u.isActive)}
                                            className={`px-3 py-1 rounded text-white ${u.isActive ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-600 hover:bg-green-700'}`}
                                            disabled={isLoading}
                                        >
                                            {isLoading
                                                ? '...'
                                                : u.isActive
                                                    ? 'Désactiver'
                                                    : 'Réactiver'}
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">--</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
