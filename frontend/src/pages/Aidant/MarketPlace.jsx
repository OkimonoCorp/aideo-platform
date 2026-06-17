import React, { useState } from 'react';
import Card from "../../components/Card.jsx";
import {Get} from "../../util/APIUtils.js";

// Mobile advantages collapsible panel
function MobileAdvantages({offresReclames, handleShowQR}){
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="flex flex-col bg-surface-container-lowest rounded-lg shadow-sm border border-outline overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2">
                <h2 className="text-lg font-semibold">Mes avantages</h2>
                <button onClick={() => setCollapsed(s => !s)} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface/80 hover:bg-surface-container-high transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transform transition-transform ${collapsed ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.243a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                </button>
            </div>
            <div className={`${collapsed ? 'hidden' : 'block'} px-3 pb-3`} style={{maxHeight: '30vh', overflowY: 'auto'}}>
                {offresReclames && (offresReclames.length === 0 ? (
                    <div className="p-3 text-center text-on-surface-variant">Aucun avantage obtenu pour le moment</div>
                ) : (
                    offresReclames.map((offre, index) => (
                        <div key={index} className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5 mb-3">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-base">{offre.nom}</h3>
                                    <p className="text-sm text-on-surface-variant mt-1">{offre.description}</p>
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button onClick={() => handleShowQR(offre)} className="px-3 py-1 rounded-md bg-surface hover:bg-surface-container transition-colors text-sm">Afficher le QR Code</button>
                            </div>
                        </div>
                    ))
                ))}
            </div>
        </div>
    )
}

function MarketPlace({token, userPoints, refreshPointsCallback}) {
    const [showNotification, setShowNotification] = useState(null);
    const [showRewardModal, setShowRewardModal] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(null);
    const [showQRModal, setShowQRModal] = useState(null);

    // -- Offres Disponibles --
    const [offresDisponibles, setOffresDisponibles] = useState();

    // Fonction pour récupérer les offres disponibles
    function fetchAvailableOffers() {
        Get('avantages/approuves', token, (data) => {
            setOffresDisponibles(data);
        });
    }

    // Charger les offres disponibles
    if (token && !offresDisponibles) {
        fetchAvailableOffers();
    }

    // -- Offres Réclamées --
    const [offresReclames, setOffresReclames] = useState();

    // Fonction pour récupérer les offres réclamées
    function fetchClaimedOffers() {
        Get('avantages/mes-avantages', token, (data) => {
            setOffresReclames(data);
        });
    }

    // Charger les offres réclamées
    if (token && !offresReclames) {
        fetchClaimedOffers();
    }

    function showToast(message, type = 'info') {
        setShowNotification({ message, type });
        setTimeout(() => setShowNotification(null), 3000);
    }

    function handleClaim(offre) {
        if (userPoints < offre.points) {
            showToast(`Vous n'avez pas assez de points. Il vous manque ${offre.points - userPoints} points.`, 'error');
            return;
        }

        // Afficher la modal de confirmation
        setShowConfirmModal(offre);
    }

    function confirmClaim() {
        const offre = showConfirmModal;
        setShowConfirmModal(null);

        // Envoyer la requête pour réclamer l'offre
        Get(`avantages/reclamer/${offre.id}`, token, () => {
            // Afficher la pop-up de récompense
            setShowRewardModal(offre);

            // Mettre à jour les listes d'offres réclamées
            fetchClaimedOffers();
        });

        // Rafraîchir les points
        refreshPointsCallback();
    }

    const handleShowQR = (offre) => {
        setShowQRModal(offre);
    };

    return (
        <div className="flex flex-col h-full w-full min-h-0 px-0 md:px-4">
            {/* Header */}
            <div>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-on-surface"> Avantages & Récompenses</h1>
                    <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary rounded-full border-2 border-primary shadow-sm">
                        <img
                            src={"/logo/favicon_primaire.svg"}
                            alt="AidéO"
                            className="h-7 w-7 shrink-0"
                        />
                        <span className="font-bold text-2xl leading-none">{userPoints}</span>
                        <span className="text-base font-medium leading-none">points</span>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmation */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface rounded-2xl shadow-2xl border border-outline p-6 max-w-md mx-4 animate-scaleIn">
                        {/* Icône */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Titre */}
                        <h2 className="text-xl font-bold text-center text-on-surface mb-2">
                            Confirmer l'obtention
                        </h2>
                        
                        {/* Message */}
                        <p className="text-center text-on-surface-variant mb-6 px-2 whitespace-nowrap">
                            Voulez-vous obtenir <span className="font-semibold text-on-surface">"{showConfirmModal.nom}"</span> pour <span className="font-bold text-primary">{showConfirmModal.points} points</span>?
                        </p>

                        {/* Détails de la récompense */}
                        <div className="bg-surface-container rounded-lg p-4 mb-6 border border-outline-variant">
                            <p className="text-sm text-on-surface-variant text-center">
                                {showConfirmModal.description}
                            </p>
                        </div>

                        {/* Points restants après */}
                        <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-primary/5 rounded-lg">
                            <span className="text-sm text-on-surface-variant">Points restants :</span>
                            <div className="flex items-center gap-1">
                                <img
                                    src={"/logo/favicon_primaire.svg"}
                                    alt="AidéO"
                                    className="h-4 w-4 shrink-0"
                                />
                                <span className="font-bold text-primary">{userPoints - showConfirmModal.points}</span>
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                className="flex-1 px-4 py-3 rounded-lg font-medium text-sm bg-surface-container text-on-surface hover:bg-surface-container-high transition-all border border-outline cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmClaim}
                                className="flex-1 px-4 py-3 rounded-lg font-medium text-sm bg-primary text-on-primary hover:opacity-90 transition-all shadow-lg cursor-pointer"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pop-up de Récompense */}
            {showRewardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="relative bg-surface dark:bg-surface rounded-3xl shadow-2xl border-2 border-primary p-8 max-w-md mx-4 animate-scaleIn dark:border-primary dark:shadow-[0_25px_50px_-12px_rgba(139,214,182,0.3)]">
                        {/* Titre */}
                        <h2 className="text-3xl font-bold text-center text-primary mb-2">
                            Félicitations !
                        </h2>
                        
                        {/* Message */}
                        <p className="text-center text-on-surface dark:text-on-surface mb-6">
                            Vous avez obtenu une nouvelle récompense
                        </p>

                        {/* Carte de la récompense */}
                        <div className="bg-primary-container dark:bg-primary-container rounded-2xl p-6 border-2 border-primary dark:border-primary shadow-lg">
                            <h3 className="font-bold text-xl text-on-primary-container dark:text-on-primary-container text-center mb-2">
                                {showRewardModal.nom}
                            </h3>
                            <p className="text-sm text-on-primary-container/80 dark:text-on-primary-container/85 text-center mb-4">
                                {showRewardModal.description}
                            </p>
                            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-surface-container rounded-full border-2 border-primary/40 dark:border-primary/50 shadow-sm dark:shadow-md">
                                <img
                                    src={"/logo/favicon_primaire.svg"}
                                    alt="AidéO"
                                    className="h-5 w-5 shrink-0"
                                />
                                <span className="font-bold text-lg text-primary dark:text-primary">{showRewardModal.points}</span>
                                <span className="text-sm text-on-surface-variant dark:text-on-surface-variant">points utilisés</span>
                            </div>
                        </div>

                        {/* Bouton de fermeture */}
                        <button
                            onClick={() => setShowRewardModal(null)}
                            className="mt-6 w-full px-6 py-3 bg-primary dark:bg-primary text-on-primary dark:text-on-primary rounded-full font-semibold hover:bg-primary/90 dark:hover:bg-primary/80 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                        >
                            Super !
                        </button>
                    </div>
                </div>
            )}

            {/* Modal QR Code */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl border border-outline dark:border-outline p-8 max-w-md mx-4 animate-scaleIn">
                        {/* Bouton de fermeture */}
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowQRModal(null)}
                                className="p-2 hover:bg-surface-container dark:hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                                title="Fermer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-on-surface dark:text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Titre */}
                        <h2 className="text-2xl font-bold text-center text-on-surface dark:text-on-surface mb-2">
                            QR Code
                        </h2>
                        
                        {/* Nom de la récompense */}
                        <p className="text-center text-on-surface-variant dark:text-on-surface-variant mb-6">
                            {showQRModal.nom}
                        </p>

                        {/* Conteneur QR Code */}
                        <div className="bg-surface-container dark:bg-surface-container rounded-xl p-6 border-2 border-outline dark:border-outline mb-6 flex items-center justify-center">
                            {showQRModal.qrCode ? (
                                <img 
                                    src={showQRModal.qrCode} 
                                    alt="QR Code" 
                                    className="w-full h-auto"
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-on-surface-variant dark:text-on-surface-variant mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-sm text-on-surface-variant dark:text-on-surface-variant">
                                        QR Code en attente
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Infos de la récompense */}
                        <div className="bg-primary/10 dark:bg-primary-container/20 rounded-lg p-4 mb-6 border border-primary/20 dark:border-primary/30">
                            <p className="text-sm text-on-surface dark:text-on-surface mb-2">
                                <span className="font-semibold">Valide jusqu'au :</span> {showQRModal.expiresAt}
                            </p>
                            <p className="text-sm text-on-surface-variant dark:text-on-surface-variant">
                                {showQRModal.description}
                            </p>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQRModal(null)}
                                className="flex-1 px-4 py-3 rounded-lg font-medium text-sm bg-surface-container dark:bg-surface-container-high text-on-surface dark:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all border border-outline dark:border-outline cursor-pointer"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={() => {
                                    if (showQRModal.qrCode) {
                                        const link = document.createElement('a');
                                        link.href = showQRModal.qrCode;
                                        link.download = `qrcode-${showQRModal.nom}.png`;
                                        link.click();
                                    }
                                }}
                                className="flex-1 px-4 py-3 rounded-lg font-medium text-sm bg-primary dark:bg-primary text-on-primary dark:text-on-primary hover:opacity-90 dark:hover:opacity-80 transition-all shadow-lg cursor-pointer"
                            >
                                Télécharger
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {showNotification && (
                <div className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
                    showNotification.type === 'success' ? 'bg-green-100 text-green-800' :
                    showNotification.type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {showNotification.message}
                </div>
            )}

            {/* Desktop: Grille principale à deux colonnes (md+) */}
            <div className="hidden md:flex flex-row flex-1 overflow-hidden gap-4 p-4 min-h-0">
                {/* Colonne GAUCHE : Disponibles */}
                <div className="flex flex-col flex-1 bg-surface-container-lowest rounded-lg shadow-sm border border-outline overflow-hidden">
                    <div className="px-6 py-4 border-b border-outline bg-surface">
                        <h2 className="text-lg font-semibold">Disponibles</h2>
                        {/*<p className="text-xs text-on-surface-variant mt-1">{offresDisponibles ? offresDisponibles.length : 0} offre{offresDisponibles && offresDisponibles.length > 1 ? 's' : ''}</p>*/}
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                        {offresDisponibles && (offresDisponibles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                <p className="text-on-surface-variant text-sm">Toutes les offres ont été obtenues !</p>
                            </div>
                        ) : (
                            offresDisponibles.map((offre, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border border-outline bg-surface hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-base">{offre.nom}</h3>
                                            <p className="text-sm text-on-surface-variant mt-1">{offre.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={"/logo/favicon_primaire.svg"}
                                                alt="AidéO"
                                                className="h-6 w-6 shrink-0"
                                            />
                                            <span className="font-semibold text-lg text-primary leading-none">{offre.points}</span>
                                            <span className="text-sm text-on-surface-variant leading-none">points</span>
                                        </div>
                                        <button 
                                            onClick={() => handleClaim(offre)}
                                            disabled={userPoints < offre.points}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                                userPoints >= offre.points
                                                    ? 'bg-primary text-on-primary hover:opacity-90 cursor-pointer'
                                                    : 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-50'
                                            }`}
                                        >
                                            {userPoints >= offre.points ? 'Obtenir' : 'Pas assez de points'}
                                        </button>
                                    </div>
                                </div>
                            )))
                        )}
                    </div>
                </div>

                {/* Colonne DROITE : Déjà réclamés */}
                <div className="flex flex-col flex-1 bg-surface-container-lowest rounded-lg shadow-sm border border-outline overflow-hidden">
                    <div className="px-6 py-4 border-b border-outline bg-surface">
                        <h2 className="text-lg font-semibold">Mes avantages</h2>
                        <p className="text-xs text-on-surface-variant mt-1">{offresReclames ? offresReclames.length : 0} avantage{offresReclames && offresReclames.length !== 1 ? 's' : ''}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                        {offresReclames && (offresReclames.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                <p className="text-on-surface-variant text-sm">Aucun avantage obtenu pour le moment</p>
                            </div>
                        ) : (
                            offresReclames.map((offre, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-base">{offre.nom}</h3>
                                            <p className="text-sm text-on-surface-variant mt-1">{offre.description}</p>
                                            <div className="flex gap-3 mt-2 text-xs">
                                                <span className="text-on-surface-variant">
                                                    Obtenu le: <span className="font-medium">{offre.dateReclamation}</span>
                                                </span>
                                                <span className="text-on-surface-variant">
                                                    Valide jusqu'au: <span className="font-medium">{offre.expiresAt}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-3 pt-3 border-t border-outline">
                                        <button
                                            onClick={() => handleShowQR(offre)}
                                            className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-container transition-colors flex items-center gap-2 text-sm font-medium text-on-surface cursor-pointer"
                                        >
                                            <span>Afficher le QR Code</span>
                                        </button>
                                    </div>
                                </div>
                            )))
                        )}
                    </div>
                </div>

            </div>

            {/* Mobile: Disponibles en haut, Mes avantages en bas (collapsible) */}
            <div className="md:hidden relative flex flex-col flex-1 gap-3 min-h-0 pb-28">
                {/* Disponibles (top) */}
                <div className="flex flex-col bg-surface-container-lowest rounded-lg shadow-sm border border-outline overflow-hidden p-3">
                    <div className="px-2 py-2 border-b border-outline bg-surface">
                        <h2 className="text-lg font-semibold">Disponibles</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 max-h-[40vh]">
                        {offresDisponibles && (offresDisponibles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-24 text-center">
                                <p className="text-on-surface-variant text-sm">Toutes les offres ont été obtenues !</p>
                            </div>
                        ) : (
                            offresDisponibles.map((offre, index) => (
                                <div key={index} className="p-3 rounded-lg border border-outline bg-surface hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-base">{offre.nom}</h3>
                                            <p className="text-sm text-on-surface-variant mt-1">{offre.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline">
                                        <div className="flex items-center gap-2">
                                            <img src={'/src/assets/logo/favicon_primaire.svg'} alt="AidéO" className="h-5 w-5 shrink-0" />
                                            <span className="font-semibold text-base text-primary leading-none">{offre.points}</span>
                                            <span className="text-sm text-on-surface-variant leading-none">points</span>
                                        </div>
                                        <button onClick={() => handleClaim(offre)} disabled={userPoints < offre.points} className={`px-3 py-1 rounded-md text-sm transition-all ${userPoints >= offre.points ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-50'}`}>
                                            {userPoints >= offre.points ? 'Obtenir' : 'Pas assez de points'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                {/* Mes avantages (bottom, collapsible fixed) */}
                <div className="absolute bottom-10 left-4 right-4 z-1000 pointer-events-none ">
                    <div className="mx-auto w-full pointer-events-auto ">
                        <MobileAdvantages
                            offresReclames={offresReclames}
                            handleShowQR={handleShowQR}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MarketPlace