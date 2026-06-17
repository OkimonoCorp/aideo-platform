import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import TextField from '../../components/TextField.jsx';
import IconButton from '../../components/IconButton.jsx';
import LogoutIcon from '/icons/logout.svg?react';

function PartnerCompany({ logoutCallback }) {
    const [formData, setFormData] = useState({
        companyName: '',
        siret: '',
        email: '',
        phone: '',
        contactPerson: '',
        about: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const draftKey = 'company_draft';

    useEffect(() => {
        if (isEditing) {
            try {
                const raw = localStorage.getItem(draftKey);
                if (raw) {
                    const draft = JSON.parse(raw);
                    setFormData(prev => ({ ...prev, ...draft }));
                }
            } catch (e) {}
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditing) {
            const onKey = (e) => {
                if (e.key === 'Escape') {
                    setIsEditing(false);
                }
            };
            window.addEventListener('keydown', onKey);
            return () => window.removeEventListener('keydown', onKey);
        }
    }, [isEditing]);

    // Gestionnaire de la validation du formulaire 
    // ex: pas de numéro de siret non numérique ...
    const validateForm = () => {
        const newErrors = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Le nom de l\'entreprise est requis';
        }

        if (formData.siret && !/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) {
            newErrors.siret = 'Le SIRET doit contenir 14 chiffres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email de contact est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'L\'email n\'est pas valide';
        }

        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Le numéro de téléphone doit contenir 10 chiffres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Sauvegarde différée du brouillon de l'entreprise pendant l'édition
    useEffect(() => {
        if (!isEditing) return;
        const id = setTimeout(() => {
            try { localStorage.setItem(draftKey, JSON.stringify(formData)); } catch (e) {}
        }, 300);
        return () => clearTimeout(id);
    }, [formData, isEditing]);

    const handleSubmit = () => {
        if (validateForm()) {
            setIsLoading(true);
            // Simulation d'appel API
            setTimeout(() => {
                setSuccessMessage('Informations mises à jour avec succès');
                setIsEditing(false);
                    try { localStorage.removeItem(draftKey); } catch (e) {}
                    setTimeout(() => setSuccessMessage(null), 3000);
                setIsLoading(false);
            }, 1000);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Remettre à l'état initial si nécessaire
    };

    // Utilise le composant partagé TextField pour les champs (comme les pages aidant)

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-on-surface">Informations administratives</h2>
                <div className="flex items-center gap-3">
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-primary text-on-primary px-6 py-2 rounded-full hover:opacity-95 transition-opacity font-medium cursor-pointer"
                        >
                            Modifier
                        </button>
                    )}
                    {/* Bouton de déconnexion */}
                    <IconButton
                        className={'logout-button w-10 h-10 flex-shrink-0'}
                        icon={<LogoutIcon className={'logout-icon-full fill-primary'}/>}
                        route={'/'}
                        onClick={logoutCallback}
                        title="Se déconnecter"
                    />
                </div>
                {/* bouton modifier profil entreprise */}
            </div>

            {successMessage && (
                <div className="fixed left-1/2 -translate-x-1/2 top-6 z-50">
                    <div className="bg-primary-container border border-primary text-on-primary-container px-4 py-3 rounded-2xl shadow-sm">
                        {successMessage}
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-error-container border border-error text-on-error-container px-4 py-3 rounded-2xl shadow-sm">
                    {error}
                </div>
            )}

            {isLoading && <LoadingSpinner />}

            <div className="bg-surface-container rounded-3xl shadow-lg p-8 border border-outline">
                <div className="mb-6">
                    {/* champ Nom de l'entreprise */}
                    <TextField
                        label="Nom de l'entreprise"
                        name="companyName"
                        currentValue={formData.companyName}
                        onChange={(e) => handleChange({ target: { name: 'companyName', value: e.target.value } })}
                        placeholder="Ex: Entreprise SA"
                        readOnly={!isEditing || isLoading}
                    />
                    {errors.companyName && <p className="text-error text-sm mt-1">{errors.companyName}</p>}
                </div>

                <div className="mb-6">
                    {/* champ Numéro SIRET */}
                    <TextField
                        label="Numéro SIRET"
                        name="siret"
                        currentValue={formData.siret}
                        onChange={(e) => handleChange({ target: { name: 'siret', value: e.target.value } })}
                        placeholder="14 chiffres"
                        readOnly={!isEditing || isLoading}
                        filter={'digits'}
                    />
                    {errors.siret && <p className="text-error text-sm mt-1">{errors.siret}</p>}
                </div>

                <div className="mb-6">
                    {/* champ Email de contact */}
                    <TextField
                        label="Email de contact"
                        name="email"
                        currentValue={formData.email}
                        onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value } })}
                        type="email"
                        placeholder="contact@entreprise.fr"
                        readOnly={!isEditing || isLoading}
                    />
                    {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="mb-6">
                    {/* champ Numéro de téléphone */}
                    <TextField
                        label="Numéro de téléphone"
                        name="phone"
                        currentValue={formData.phone}
                        onChange={(e) => handleChange({ target: { name: 'phone', value: e.target.value } })}
                        type="tel"
                        placeholder="01 23 45 67 89"
                        readOnly={!isEditing || isLoading}
                        filter={'phone'}
                    />
                    {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="mb-6">
                    {/* champ Personne à contacter */}
                    <TextField
                        label="Personne à contacter"
                        name="contactPerson"
                        currentValue={formData.contactPerson}
                        onChange={(e) => handleChange({ target: { name: 'contactPerson', value: e.target.value } })}
                        placeholder="Nom et prénom"
                        readOnly={!isEditing || isLoading}
                    />
                </div>

                <div className="mb-6">
                    {/* champ À propos de l'entreprise */}
                    <label className="block text-sm font-medium text-on-surface mb-2">À propos de l'entreprise</label>
                    <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        rows={5}
                        maxLength={1000}
                        className={`w-full px-4 py-2 rounded-lg shadow-inner focus:outline-none focus:ring-2 resize-none text-on-surface ${!isEditing ? 'bg-surface border border-outline' : 'bg-surface-container-lowest border border-primary'}`}
                        placeholder="Présentez votre entreprise..."
                    />
                </div>

                {isEditing && (
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 bg-primary text-on-primary py-2 rounded-full hover:opacity-95 transition-opacity disabled:opacity-50 font-medium cursor-pointer"
                        >
                            Enregistrer
                        </button>
                        {/* bouton enregistrer */}
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1 bg-surface-container text-on-surface py-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-50 font-medium cursor-pointer"
                        >
                            Annuler
                        </button>
                        {/* bouton annuler édition */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PartnerCompany;
