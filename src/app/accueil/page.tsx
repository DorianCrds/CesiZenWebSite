export default function AccueilPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-6">
                    Bienvenue sur <span className="text-indigo-600">CesiZen</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                    Votre espace bien-être pour étudiants du Cesi. Ressources, conseils,
                    exercices et outils pour mieux gérer le stress.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a
                        href="/explorer"
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
                    >
                        Explorer
                    </a>
                    <a
                        href="/login"
                        className="px-6 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition"
                    >
                        Se connecter
                    </a>
                </div>
            </div>
        </main>
    );
}
