// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            router.push('/'); // rediriger après login
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-4 border rounded">
            <h1 className="text-xl mb-4">Connexion</h1>
            {error && <p className="text-red-600">{error}</p>}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full mb-3 p-2 border"
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full mb-3 p-2 border"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                {loading ? 'Chargement...' : 'Se connecter'}
            </button>
        </form>
    );
}
