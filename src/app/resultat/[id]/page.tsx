'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ResultPage() {
    const { id } = useParams();
    const [response, setResponse] = useState<any>(null);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:4000/cesizen/api/v1/user-responses/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }).then(res => {
                setResponse(res.data);
            }).catch(err => {
                console.error("Erreur de récupération :", err);
            });
        }
    }, [id]);

    const interpretScore = (score: number): string => {
        if (score < 50) return 'Niveau de stress faible';
        if (score < 100) return 'Niveau de stress modéré';
        return 'Niveau de stress élevé';
    };

    if (!response) return <div className="text-center p-10">Chargement…</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Résultat du Questionnaire</h1>
            <p className="text-lg text-gray-600 mb-6">
                <span className="font-semibold">Questionnaire :</span> {response.questionnaire?.title}
            </p>

            <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                <p className="text-xl font-semibold text-gray-800">
                    Score total : {response.totalScore}
                </p>
                <p className="text-md text-gray-600 mt-2">
                    {response.feedbackMessage || "Aucune interprétation disponible."}
                </p>

            </div>

            <div className="pt-4 flex justify-between">
                <a href="/" className="text-blue-600 hover:underline">Retour à l'accueil</a>
                <a href={`/questionnaire/${response.questionnaireId}`} className="text-blue-600 hover:underline">Refaire le test</a>
            </div>
        </div>
    );
}
