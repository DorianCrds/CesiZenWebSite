'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const { login } = useAuth(); // On va réutiliser login pour stocker user et token après inscription
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirm) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            // Appel API register
            const res = await fetch('http://localhost:4000/cesizen/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstname, lastname }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Erreur lors de l\'inscription');
                setLoading(false);
                return;
            }

            // Récupérer token reçu
            const { token } = await res.json();
            localStorage.setItem('token', token);

            // Appeler login dans le contexte pour récupérer user et stocker token
            await login(email, password);

            router.push('/'); // redirection après inscription
        } catch (err) {
            setError('Erreur serveur');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-4 border rounded">
            <h1 className="text-xl mb-4">Inscription</h1>

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
                type="text"
                placeholder="Prénom"
                value={firstname}
                onChange={e => setFirstname(e.target.value)}
                required
                className="w-full mb-3 p-2 border"
            />

            <input
                type="text"
                placeholder="Nom"
                value={lastname}
                onChange={e => setLastname(e.target.value)}
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

            <input
                type="password"
                placeholder="Confirmez le mot de passe"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                className="w-full mb-3 p-2 border"
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? 'Chargement...' : 'S\'inscrire'}
            </button>
        </form>
    );
}
