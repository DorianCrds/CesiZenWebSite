'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Stats {
    usersCount: number;
    contentCount: number;
    questionnaireCount: number;
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;

            try {
                const res = await fetch('http://localhost:4000/cesizen/api/v1/admin/stats', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error('Erreur chargement dashboard admin :', err);
            }
        };

        fetchStats();
    }, [token]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>

            {!stats ? (
                <p>Chargement des statistiques...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gray-100 rounded-xl p-4 shadow">
                        <h2 className="text-lg font-semibold">Utilisateurs</h2>
                        <p className="text-3xl text-blue-600 font-bold">{stats.usersCount}</p>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 shadow">
                        <h2 className="text-lg font-semibold">Contenus</h2>
                        <p className="text-3xl text-blue-600 font-bold">{stats.contentCount}</p>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 shadow">
                        <h2 className="text-lg font-semibold">Questionnaires</h2>
                        <p className="text-3xl text-blue-600 font-bold">{stats.questionnaireCount}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
