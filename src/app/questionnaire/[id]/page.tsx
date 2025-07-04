'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function QuestionnairePage() {
    const { id } = useParams();
    const router = useRouter();

    const [questionnaire, setQuestionnaire] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:4000/cesizen/api/v1/questionnaires/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }).then(res => {
                setQuestionnaire(res.data);
                setEvents(res.data.events || []); // sécurité
            });
        }
    }, [id]);

    const handleToggle = (eventId: number, checked: boolean) => {
        setSelectedEventIds(prev => {
            if (checked) return [...prev, eventId];
            return prev.filter(id => id !== eventId);
        });
    };

    const handleSubmit = async () => {
        const selected = events.filter(e => selectedEventIds.includes(e.id));
        const totalScore = selected.reduce((acc, ev) => acc + ev.score, 0);

        try {
            const response = await axios.post('/cesizen/api/v1/user-responses', {
                userId: 123, // à remplacer par une valeur dynamique (ex : depuis le contexte d'auth)
                questionnaireId: parseInt(id as string),
                selectedEvents: JSON.stringify(selectedEventIds),
                totalScore,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            router.push(`/result/${response.data.id}`);
        } catch (err) {
            console.error('Erreur lors de la soumission :', err);
        }
    };

    if (!questionnaire) return <div>Chargement…</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{questionnaire.title}</h1>
            <p className="text-gray-600 mb-6">{questionnaire.description}</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="space-y-6"
            >
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 transition hover:shadow-md"
                    >
                        <p className="text-lg font-medium text-gray-800 mb-2">{event.label}</p>
                        <div className="flex gap-6">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`event-${event.id}`}
                                    className="form-radio h-5 w-5 text-blue-600"
                                    onChange={() => handleToggle(event.id, true)}
                                    checked={selectedEventIds.includes(event.id)}
                                />
                                <span className="text-gray-700">Oui</span>                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`event-${event.id}`}
                                    className="form-radio h-5 w-5 text-red-500"
                                    onChange={() => handleToggle(event.id, false)}
                                    checked={!selectedEventIds.includes(event.id)}
                                />
                                <span className="text-gray-700">Non</span>
                            </label>
                        </div>
                    </div>
                ))}

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
                    >
                        Calculer mon niveau de stress
                    </button>
                </div>
            </form>
        </div>
    );
}
