// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    role: { id: number; label: string };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Au chargement, on récupère token dans localStorage puis user via /me
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setLoading(false);
            return;
        }

        setToken(storedToken);

        fetch('http://localhost:4000/cesizen/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
            },
        })
            .then(async (res) => {
                if (!res.ok) throw new Error('Token invalide');
                const data = await res.json();
                setUser(data);
            })
            .catch(() => {
                // Token invalide ou expiré
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        const res = await fetch('http://localhost:4000/cesizen/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            setLoading(false);
            throw new Error('Identifiants invalides');
        }

        const { token } = await res.json();
        localStorage.setItem('token', token);
        setToken(token);

        // Récupérer infos utilisateur après login
        const meRes = await fetch('http://localhost:4000/cesizen/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!meRes.ok) {
            setLoading(false);
            throw new Error('Impossible de récupérer l’utilisateur');
        }

        const userData = await meRes.json();
        setUser(userData);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return ctx;
};
