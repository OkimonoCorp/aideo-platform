import React from 'react';
import {useNavigate} from 'react-router-dom';

const Confidentialite = () => {
    const nav = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-surface-variant">
            {/* Header */}
            <header className="bg-surface border-b border-outline px-6 lg:px-14 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => nav('/')}
                        className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
                        aria-label="Retour"
                    >
                        <span className="text-xl">←</span>
                    </button>
                    <img
                        src="/logo/logo_primaire_noire.svg"
                        alt="AidéO"
                        className="h-10 w-auto cursor-pointer"
                        onClick={() => nav('/')}
                    />
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-surface rounded-2xl shadow-lg p-8 border border-outline">
                    <h1 className="text-3xl font-bold text-primary mb-8">Politique de Confidentialité</h1>

                    {/* Remplacement : version courte et claire indiquant l'utilisation d'un seul cookie d'authentification */}
                    <section className="mb-8">
                        <p className="text-on-surface-variant mb-4">
                            Notre site utilise uniquement un cookie d'authentification pour gérer la session
                            utilisateur.
                        </p>

                        <ul className="list-disc list-inside text-on-surface-variant space-y-2 mb-4 ml-4">
                            <li><strong>Quel cookie :</strong> Un cookie contenant un token d'authentification.</li>
                            <li><strong>Usage :</strong> Maintenir votre connexion et authentifier vos requêtes auprès
                                du serveur.
                            </li>
                            <li><strong>Données stockées :</strong> Seul le token sécurisé est stocké dans le cookie ;
                                aucun autre renseignement personnel n'est conservé dans les cookies.
                            </li>
                            <li><strong>Durée :</strong> Le cookie expire à la déconnexion ou selon la durée configurée
                                côté serveur.
                            </li>
                            <li><strong>Sécurité :</strong> Le cookie est envoyé uniquement via HTTPS et traité en
                                HttpOnly côté client ; le token est validé côté serveur.
                            </li>
                        </ul>

                        <p className="text-on-surface-variant mb-4">
                            Pour toute question relative à la protection des données : <strong>dpo@aideo.fr</strong>
                        </p>
                    </section>

                    <div className="border-t border-outline pt-6 mt-8">
                        <p className="text-sm text-on-surface-variant">
                            Dernière mise à jour : 16 janvier 2026
                        </p>
                        <button
                            data-testid="btn-home-conf"
                            onClick={() => nav('/')}
                            className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full hover:opacity-95 transition-opacity"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </main>

            {/* Espace pour séparer le footer  */}
            <div className="grow"/>

            {/* Footer */}
            <footer
                className="border-t border-outline py-6 px-6 lg:px-14 flex flex-col sm:flex-row justify-between items-center text-sm text-on-surface-variant bg-surface">
                <span>© {new Date().getFullYear()} AidéO • Plateforme d'entraide communautaire pour aidants familiaux</span>
                <div className="flex gap-4 mt-2 sm:mt-0">
                    <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
                    <a href="/confidentialite" className="hover:underline">Confidentialité</a>
                    <a href="/contact" className="hover:underline">Contact</a>
                </div>
            </footer>
        </div>
    );
};

export default Confidentialite;
