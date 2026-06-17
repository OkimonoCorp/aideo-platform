import React, {useState, useRef} from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';


const CGUModal = ({isOpen, onClose, onAccept}) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const scrollContentRef = useRef(null);

    const handleScroll = (e) => {
        const element = e.target;
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
        setHasScrolledToBottom(isAtBottom);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-scrim/50 flex items-center justify-center z-50">
            <div className="bg-surface-container rounded-3xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col relative border border-outline-variant">
                {/* Message d'indice - Bulle */}
                {!hasScrolledToBottom && (
                    <div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce whitespace-nowrap">
                        📖 Lisez tout les CGU pour continuer
                    </div>
                )}

                {/* Header */}
                <div
                    className="flex justify-between items-center pr-6 pl-6 border-b border-outline-variant sticky top-0 bg-surface-container rounded-t-3xl">
                    <h1 className="text-2xl font-bold text-primary">Conditions Générales d'Utilisation</h1>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-on-surface text-2xl"
                        aria-label="Fermer"
                    >
                        ×
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div
                    ref={scrollContentRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto flex-1 p-6 text-on-surface-variant"
                >
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">1. Objet et Acceptation</h2>
                        <p className="mb-3">
                            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de
                            la plateforme Aidéo (ci-après « la Plateforme »).
                            En créant un compte et en utilisant la Plateforme, vous acceptez l'intégralité de ces
                            conditions.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">2. Données Collectées et Stockées</h2>
                        <p className="mb-3">Notre Plateforme collecte et stocke les données personnelles suivantes :</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                            <li><strong className="text-on-surface">Informations d'identification :</strong> Prénom, nom, email et numéro de
                                téléphone
                            </li>
                            <li><strong className="text-on-surface">Adresse :</strong> Votre adresse postale</li>
                            <li><strong className="text-on-surface">Authentification :</strong> Mot de passe (chiffré)</li>
                            <li><strong className="text-on-surface">Profil utilisateur :</strong> Pseudonyme (optionnel), rôle
                                (Aidant/Professionnel)
                            </li>
                            <li><strong className="text-on-surface">Données de performance :</strong> Points d'engagement (pour les Aidants)</li>
                            <li><strong className="text-on-surface">Messagerie :</strong> Contenu des messages, timestamps, expéditeur et
                                destinataire
                            </li>
                            <li><strong className="text-on-surface">Tâches et services :</strong> Tâches assignées, services candidatés, avantages
                                recueillis
                            </li>
                            <li><strong className="text-on-surface">Groupes :</strong> Adhésion à des groupes et collectifs</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">3. Utilisation des Données</h2>
                        <p className="mb-3">Les données collectées sont utilisées pour :</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                            <li>Créer et gérer votre compte utilisateur</li>
                            <li>Faciliter la communication entre aidants</li>
                            <li>Assigner et suivre les tâches et services</li>
                            <li>Gérer les groupes et collectifs</li>
                            <li>Améliorer les services et l'expérience utilisateur</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">4. Sécurité des Données</h2>
                        <p className="mb-3">
                            Nous mettons en place des mesures de sécurité appropriées pour protéger vos données
                            personnelles contre
                            tout accès, modification ou suppression non autorisée. Les mots de passe sont chiffrés et
                            stockés de manière sécurisée.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">5. Conservation des Données</h2>
                        <p className="mb-3">
                            Vos données sont conservées aussi longtemps que votre compte est actif. Vous pouvez demander
                            la suppression
                            de votre compte et de vos données personnelles à tout moment en contactant notre support.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">6. Droits de l'Utilisateur</h2>
                        <p className="mb-3">Conformément à la législation applicable, vous avez le droit de :</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                            <li>Accéder à vos données personnelles</li>
                            <li>Demander la correction de données inexactes</li>
                            <li>Demander la suppression de vos données</li>
                            <li>Vous opposer au traitement de vos données</li>
                            <li>Demander la portabilité de vos données</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">7. Responsabilité de l'Utilisateur</h2>
                        <p className="mb-3">Vous vous engagez à :</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                            <li>Fournir des informations exactes et à jour</li>
                            <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                            <li>Utiliser la Plateforme de manière légale et éthique</li>
                            <li>Respecter les droits d'autrui</li>
                            <li>Ne pas utiliser la Plateforme pour des activités frauduleuses ou nuisibles</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">8. Limitation de Responsabilité</h2>
                        <p className="mb-3">
                            La Plateforme est fournie « telle quelle » sans garantie d'aucune sorte. Nous ne sommes pas
                            responsables
                            des dommages indirects ou consécutifs découlant de votre utilisation de la Plateforme.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">9. Modifications des CGU</h2>
                        <p className="mb-3">
                            Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications seront
                            notifiées
                            aux utilisateurs par email ou notification sur la Plateforme.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-primary mb-3">10. Contact</h2>
                        <p className="mb-3">
                            Pour toute question ou réclamation concernant ces CGU ou vos données personnelles, veuillez
                            nous contacter à :
                            <strong className="text-on-surface"> aideo@navilink.fr</strong>
                        </p>
                    </section>

                    <p className="text-sm text-on-surface-variant border-t border-outline-variant pt-4">
                        Dernière mise à jour : 9 janvier 2026
                    </p>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 pr-6 pl-6 pt-6 border-t border-outline-variant sticky bottom-0 bg-surface-container rounded-b-3xl">

                    {/* Boutons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-outline rounded-full text-on-surface hover:bg-surface-container-high transition"
                        >
                            Fermer
                        </button>
                        <button
                            onClick={onAccept}
                            disabled={!hasScrolledToBottom}
                            className={`flex-1 px-4 py-2 rounded-full transition ${
                                hasScrolledToBottom
                                    ? 'bg-primary text-on-primary hover:bg-primary/90'
                                    : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                            }`}
                        >
                            {hasScrolledToBottom ? 'J\'accepte' : 'À lire jusqu\'au bout'}
                        </button>
                    </div>
                    {/* Logo en bas */}
                    <div
                        className="flex item-center text-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                        <img
                            src={isDarkMode ? "/logo/logo_primaire_blanc.svg" : "/logo/logo_primaire_noire.svg"}
                            alt="logo"
                            className="w-16 items-center justify-center mx-auto "
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CGUModal;
