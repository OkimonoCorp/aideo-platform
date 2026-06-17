import React, {useState, useEffect} from 'react';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AdvantageCard from '../../components/Partner/AdvantageCard.jsx';
import AdvantageForm from '../../components/Partner/AdvantageForm.jsx';
import {Get, Post, Delete} from '../../util/APIUtils.js';

function PartnerAdvantages({token}) {
    const [advantages, setAdvantages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Récupérer les avantages depuis l'API
    const refreshAdvantages = () => {
        if (token) {
            setIsLoading(true);
            Get('avantages', token, (data) => {
                const newAdvantages = data.map(adv => ({
                    id: adv.id,
                    title: adv.nom,
                    description: adv.description,
                    pointsAssigned: adv.pointsAssigned || 0,
                    status: adv.approuve,
                }));
                setAdvantages(newAdvantages);
                setIsLoading(false);
            });
        }
    };

    // Charger les avantages au montage du composant
    useEffect(() => {
        refreshAdvantages();
    }, [token]);

    // Fermer le formulaire avec Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && showForm) setShowForm(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showForm]);

    // Créer un nouvel avantage via l'API
    const handleCreateOrUpdate = (formData) => {
        setIsLoading(true);
        Post('avantages', token, {
            nom: formData.title,
            description: formData.description
        }, () => {
            setSuccessMessage('Avantage créé et en attente de validation par le modérateur');
            setShowForm(false);
            setTimeout(() => setSuccessMessage(null), 3000);
            refreshAdvantages();
        });
    };

    // Supprimer un avantage via l'API
    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avantage ?')) {
            setIsLoading(true);
            Delete('avantages/' + id, token, () => {
                setAdvantages(prev => prev.filter(adv => adv.id !== id));
                setSuccessMessage('Avantage supprimé avec succès');
                setTimeout(() => setSuccessMessage(null), 3000);
                setIsLoading(false);
            });
        }
    };

    const handleToggleActive = (id) => {
        setAdvantages(prev => prev.map(a => a.id === id ? {...a, active: !a.active} : a));
    };

    const handleCloseForm = () => {
        // Ferme simplement la popup ; le brouillon reste dans le localStorage géré par AdvantageForm
        setShowForm(false);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">

            <div className="flex justify-between items-center">
                {/* <img
                    src={"/src/assets/logo/logo_submark_secondaire.svg"}
                    alt="submark"
                    className="absolute top-center left-1/2 -translate-x-1/2 w-250 opacity-90 z-0"
                /> */}
                {/* titre section avantages */}
                <h2 className="text-3xl font-bold text-on-surface">Avantages proposés</h2>
                <button
                    onClick={() => setShowForm(true)}
                    disabled={isLoading || showForm}
                    className="bg-primary text-on-primary px-6 py-2 rounded-full hover:opacity-95 transition-opacity disabled:opacity-50 font-medium cursor-pointer"
                >
                    + Ajouter un avantage
                </button>
                {/* bouton ouvrir formulaire avantage */}
            </div>

            {successMessage && (
                <div className="fixed left-1/2 -translate-x-1/2 top-6 z-50">
                    <div
                        className="bg-primary-container border border-primary text-on-primary-container px-4 py-3 rounded-2xl shadow-sm">
                        {successMessage}
                    </div>
                </div>
            )}

            {error && (
                <div
                    className="bg-error-container border border-error text-on-error-container px-4 py-3 rounded-2xl shadow-sm">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center z-30" onClick={handleCloseForm}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"/>
                    <div className="relative z-40 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        {/* modal avantage */}
                        <AdvantageForm
                            onSubmit={handleCreateOrUpdate}
                            onCancel={handleCloseForm}
                            isLoading={isLoading}
                            draftKey={'advantage_draft'}
                        />
                    </div>
                </div>
            )}

            {isLoading && !showForm && <LoadingSpinner/>}

            {!isLoading && advantages.length === 0 && !showForm && (
                <div className="text-center py-12 bg-surface-container rounded-3xl shadow-inner">
                    <p className="text-on-surface text-lg">Aucun avantage proposé pour le moment.</p>
                    <p className="text-on-surface-variant text-sm mt-2">Créez votre premier avantage pour commencer
                        !</p>
                </div>
            )}

            <div className="space-y-4">
                {/* liste des avantages (cartes) */}
                {advantages.map(advantage => (
                    <AdvantageCard
                        key={advantage.id}
                        advantage={advantage}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </div>
    );
}

export default PartnerAdvantages;
