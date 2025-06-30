// app/a-propos/page.tsx
import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
            <section className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">À propos de CesiZen</h1>
                <p className="text-lg text-gray-600">
                    Une plateforme pour mieux comprendre et gérer votre santé mentale au quotidien.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Notre mission</h2>
                <p className="text-gray-700">
                    CesiZen est une initiative du ministère de la Santé et de la Prévention. Elle vise à proposer au
                    grand public un accès simplifié à des outils interactifs de prévention en santé mentale,
                    centrés notamment sur la gestion du stress.
                </p>
                <p className="text-gray-700">
                    L’objectif est d’aider chacun à comprendre son état émotionnel, à travers des contenus fiables,
                    des diagnostics personnalisés et des activités de relaxation accessibles.
                </p>
            </section>

            {/* 📸 Première image centrée */}
            <div className="flex justify-center">
                {/* Tu peux remplacer le src par ton image, ex: /images/sante-mentale.jpg */}
                <div className="w-full max-w-md">
                    <Image
                        src="/images/a-propos-1.png"
                        alt="Santé mentale"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-lg object-cover"
                    />
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Fonctionnalités clés</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Informations validées par des experts en santé mentale</li>
                    <li>Diagnostics interactifs basés sur l’échelle de Holmes et Rahe</li>
                    <li>Exercices de relaxation guidés</li>
                    <li>Suivi émotionnel avec un tracker intégré</li>
                    <li>Activités de détente à explorer</li>
                </ul>
            </section>

            {/* 📸 Deuxième image centrée */}
            <div className="flex justify-center">
                {/* Tu peux remplacer le src par ton image, ex: /images/relaxation.jpg */}
                <div className="w-full max-w-md">
                    <Image
                        src="/images/a-propos-2.jpg"
                        alt="Exercices de détente"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-lg object-cover"
                    />
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Sécurité et confidentialité</h2>
                <p className="text-gray-700">
                    CesiZen respecte les normes du RGPD. Aucune donnée médicale n’est partagée ou exploitée.
                    L'utilisateur garde le contrôle total de ses informations.
                </p>
            </section>

            <section className="text-center pt-8">
                <p className="text-gray-600">
                    Merci de faire partie de la communauté <span className="font-semibold text-blue-600">CesiZen</span> 💙
                </p>
            </section>
        </main>
    );
}
