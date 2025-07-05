'use client';

import { useEffect, useState, useRef } from 'react';
import {useAuth} from "@/app/context/AuthContext";

interface Event {
    id: number;
    label: string;
    score: number;
    questionnaireId: number;
    createdAt: string;
    updatedAt: string;
}

interface Questionnaire {
    id: number;
    title: string;
    description: string;
    events: Event[];
    createdAt: string;
    updatedAt: string;
}

export default function QuestionnaireAdminPage() {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        label: '',
        score: 0,
        questionnaireId: 0
    });
    const [errors, setErrors] = useState({
        label: '',
        score: '',
        api: ''
    });
    const formSectionRef = useRef<HTMLDivElement>(null);
    const { token } = useAuth();

    const fetchQuestionnaires = async () => {
        try {
            const res = await fetch('http://localhost:4000/cesizen/api/v1/questionnaires', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setQuestionnaires(data);
            if (data.length > 0) {
                setSelectedQuestionnaire(data[0]);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des questionnaires:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:4000/cesizen/api/v1/events', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des événements:', error);
        }
    };

    useEffect(() => {
        if (token) {
            Promise.all([fetchQuestionnaires(), fetchEvents()])
                .finally(() => setIsLoading(false));
        }
    }, [token]);

    const validateForm = () => {
        const newErrors = {
            label: '',
            score: '',
            api: ''
        };

        // Validation du label (min 3, max 255 caractères)
        if (!formData.label) {
            newErrors.label = 'Le label est requis';
        } else if (formData.label.length < 3) {
            newErrors.label = 'Le label doit contenir au moins 3 caractères';
        } else if (formData.label.length > 255) {
            newErrors.label = 'Le label ne peut pas dépasser 255 caractères';
        }

        // Validation du score (entier >= 0)
        if (formData.score < 0) {
            newErrors.score = 'Le score doit être supérieur ou égal à 0';
        } else if (!Number.isInteger(formData.score)) {
            newErrors.score = 'Le score doit être un nombre entier';
        }

        setErrors(newErrors);
        return !newErrors.label && !newErrors.score;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedQuestionnaire) return;

        // Validation côté client
        if (!validateForm()) {
            return;
        }

        try {
            const url = editingEvent
                ? `http://localhost:4000/cesizen/api/v1/events/${editingEvent.id}`
                : 'http://localhost:4000/cesizen/api/v1/events';

            const method = editingEvent ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                questionnaireId: selectedQuestionnaire.id
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                await fetchEvents();
                resetForm();
                setErrors({ label: '', score: '', api: '' });
                // Feedback de succès plus discret
                const successMessage = editingEvent ? 'Événement modifié avec succès' : 'Événement créé avec succès';
                console.log(successMessage);
            } else {
                const errorData = await res.json();
                setErrors(prev => ({ ...prev, api: errorData.error || 'Erreur lors de la sauvegarde' }));
            }
        } catch (error) {
            console.error('Erreur:', error);
            setErrors(prev => ({ ...prev, api: 'Erreur de connexion au serveur' }));
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            label: event.label,
            score: event.score,
            questionnaireId: event.questionnaireId
        });
        setIsCreating(true);

        // Scroll vers la section de modification avec un petit délai
        setTimeout(() => {
            formSectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Optionnel : focus sur le premier champ
            const firstInput = formSectionRef.current?.querySelector('input');
            firstInput?.focus();
        }, 100);
    };

    const handleAddNew = () => {
        setIsCreating(true);
        setTimeout(() => {
            formSectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            const firstInput = formSectionRef.current?.querySelector('input');
            firstInput?.focus();
        }, 100);
    };

    const handleDelete = async (eventId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

        try {
            const res = await fetch(`http://localhost:4000/cesizen/api/v1/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                await fetchEvents();
                console.log('Événement supprimé avec succès');
            } else {
                const errorData = await res.json();
                console.error('Erreur lors de la suppression:', errorData.error);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            label: '',
            score: 0,
            questionnaireId: 0
        });
        setEditingEvent(null);
        setIsCreating(false);
        setErrors({ label: '', score: '', api: '' });
    };

    const filteredEvents = selectedQuestionnaire
        ? events.filter(event => event.questionnaireId === selectedQuestionnaire.id)
        : [];

    if (isLoading) {
        return <div className="p-4">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-4">Gestion des questionnaires</h1>

            {/* Sélection du questionnaire */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-3">Sélectionner un questionnaire</h2>
                <select
                    value={selectedQuestionnaire?.id || ''}
                    onChange={(e) => {
                        const questionnaire = questionnaires.find(q => q.id === parseInt(e.target.value));
                        setSelectedQuestionnaire(questionnaire || null);
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                >
                    <option value="">Sélectionnez un questionnaire</option>
                    {questionnaires.map((questionnaire) => (
                        <option key={questionnaire.id} value={questionnaire.id}>
                            {questionnaire.title}
                        </option>
                    ))}
                </select>

                {selectedQuestionnaire && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">{selectedQuestionnaire.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredEvents.length} événement(s) associé(s)
                        </p>
                    </div>
                )}
            </div>

            {selectedQuestionnaire && (
                <>
                    {/* Bouton d'ajout */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">
                            Événements - {selectedQuestionnaire.title}
                        </h2>
                        <button
                            onClick={handleAddNew}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            ➕ Ajouter un événement
                        </button>
                    </div>

                    // Remplacez la section de création/modification par :
                    {isCreating && (
                        <div ref={formSectionRef} className="bg-white p-4 rounded-lg shadow border-2 border-blue-200">
                            <h3 className="text-md font-semibold mb-3">
                                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {errors.api && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                        {errors.api}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Label de l'événement *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData({...formData, label: e.target.value})}
                                        className={`w-full p-2 border rounded ${errors.label ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ex: Décès d'un proche"
                                    />
                                    {errors.label && (
                                        <p className="text-red-500 text-sm mt-1">{errors.label}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Score de stress * (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.score}
                                        onChange={(e) => setFormData({...formData, score: parseInt(e.target.value) || 0})}
                                        className={`w-full p-2 border rounded ${errors.score ? 'border-red-500' : 'border-gray-300'}`}
                                        min="0"
                                        max="100"
                                        placeholder="Ex: 100"
                                    />
                                    {errors.score && (
                                        <p className="text-red-500 text-sm mt-1">{errors.score}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            // Créer un événement artificiel pour handleSubmit
                                            const fakeEvent = {
                                                preventDefault: () => {}
                                            };
                                            handleSubmit(fakeEvent);
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={!formData.label || formData.score < 0}
                                    >
                                        {editingEvent ? 'Modifier' : 'Créer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Annuler
                                    </button>
                                </div>
                                <div className="text-sm text-gray-500">
                                    * Champs obligatoires
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Liste des événements */}
                    <div className="bg-white rounded-lg shadow">
                        {filteredEvents.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Aucun événement trouvé pour ce questionnaire.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredEvents
                                    .sort((a, b) => b.score - a.score)
                                    .map((event) => (
                                        <div key={event.id} className="p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        {event.label}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm text-gray-500">Score:</span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            event.score >= 80 ? 'bg-red-100 text-red-800' :
                                                                event.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                        }`}>
                                                        {event.score} points
                                                    </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => handleEdit(event)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(event.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Statistiques */}
                    {filteredEvents.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-md font-semibold mb-2">Statistiques</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {filteredEvents.length}
                                    </p>
                                    <p className="text-sm text-gray-500">Total événements</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {Math.min(...filteredEvents.map(e => e.score))}
                                    </p>
                                    <p className="text-sm text-gray-500">Score minimum</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">
                                        {Math.max(...filteredEvents.map(e => e.score))}
                                    </p>
                                    <p className="text-sm text-gray-500">Score maximum</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}