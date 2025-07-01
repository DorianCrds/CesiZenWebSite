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
    const { token, user } = useAuth();

    const fetchUsers = async () => {
        const res = await fetch('http://localhost:4000/cesizen/api/v1/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
    };

    const toggleActive = async (id: number, isActive: boolean) => {
        await fetch(`http://localhost:4000/cesizen/api/v1/users/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ isActive: !isActive })
        });
        fetchUsers(); // refresh
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
                {users.map(u => {
                    const isAdmin = u.role?.label === 'admin';
                    const canToggle = isSuperAdmin || !isAdmin;
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
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        {u.isActive ? 'Désactiver' : 'Réactiver'}
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
