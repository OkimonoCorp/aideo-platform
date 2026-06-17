import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner.jsx';
import FormField from '../FormField.jsx';

/**
 * Composant modal/formulaire pour créer ou modifier une adresse
 */
function AddressForm({ address = null, onSubmit, onCancel, isLoading = false, draftKey = null, readOnly = false }) {
    const [label, setLabel] = useState(address?.label || '');
    const [street, setStreet] = useState(address?.street || '');
    const [city, setCity] = useState(address?.city || '');
    const [postalCode, setPostalCode] = useState(address?.postalCode || '');
    const [country, setCountry] = useState(address?.country || 'France');
    const [isPrimary, setIsPrimary] = useState(address?.isPrimary || false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!address && draftKey) {
            try {
                const raw = localStorage.getItem(draftKey);
                if (raw) {
                    const draft = JSON.parse(raw);
                    if (draft.label) setLabel(draft.label);
                    if (draft.street) setStreet(draft.street);
                    if (draft.city) setCity(draft.city);
                    if (draft.postalCode) setPostalCode(draft.postalCode);
                    if (draft.country) setCountry(draft.country);
                    if (draft.isPrimary) setIsPrimary(draft.isPrimary);
                }
            } catch (e) {}
        }
    }, [address, draftKey]);

    // Sauvegarde différée du brouillon
    useEffect(() => {
        if (readOnly || !draftKey) return;
        const id = setTimeout(() => {
            try {
                const draft = { label, street, city, postalCode, country, isPrimary };
                localStorage.setItem(draftKey, JSON.stringify(draft));
            } catch (e) {}
        }, 300);
        return () => clearTimeout(id);
    }, [label, street, city, postalCode, country, isPrimary, draftKey, readOnly]);

    const validateForm = () => {
        const newErrors = {};
        if (!label.trim()) newErrors.label = 'Le libellé est requis (ex: Siège social)';
        if (!street.trim()) newErrors.street = 'L\'adresse est requise';
        if (!city.trim()) newErrors.city = 'La ville est requise';
        else if (/\d/.test(city)) newErrors.city = 'La ville ne doit pas contenir de chiffres';
        else if (city.length > 50) newErrors.city = 'La ville est trop longue';
        if (!postalCode.trim() || !/^\d{5}$/.test(postalCode)) newErrors.postalCode = 'Le code postal doit contenir 5 chiffres';
        else if (postalCode.length > 10) newErrors.postalCode = 'Code postal trop long';
        if (!country.trim()) newErrors.country = 'Le pays est requis';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit({
                label: label.trim(),
                street: street.trim(),
                city: city.trim(),
                postalCode: postalCode.trim(),
                country: country.trim(),
                isPrimary
            });
        }
    };

    return (
        <div className="bg-surface-container/80 backdrop-blur-md rounded-4xl shadow-lg p-8 max-w-md w-full border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-on-surface">{address ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h2>

            {isLoading && <LoadingSpinner />}

            <div className="mb-4">
                {/* champ libellé (ex: Siège social) */}
                <label className="block text-sm font-medium text-on-surface mb-1">Libellé *</label>
                <FormField
                    placeholder="Ex: Siège social"
                    currentValue={label}
                    onChange={(v) => setLabel(String(v).slice(0, 100))}
                    required
                    disabled={isLoading || readOnly}
                />
                {errors.label && <p className="text-error text-sm mt-1">{errors.label}</p>}
            </div>

            <div className="mb-4">
                {/* champ adresse (rue) */}
                <label className="block text-sm font-medium text-on-surface mb-1">Adresse *</label>
                <FormField
                    placeholder="Ex: 123 rue de la Paix"
                    currentValue={street}
                    onChange={(v) => setStreet(String(v).slice(0, 100))}
                    required
                    disabled={isLoading || readOnly}
                />
                {errors.street && <p className="text-error text-sm mt-1">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    {/* champ code postal */}
                    <label className="block text-sm font-medium text-on-surface mb-1">Code postal *</label>
                    <FormField
                        placeholder="75001"
                        currentValue={postalCode}
                        onChange={(v) => setPostalCode(String(v).replace(/[^0-9]/g, '').slice(0, 10))}
                        required
                        disabled={isLoading || readOnly}
                        type="text"
                    />
                    {errors.postalCode && <p className="text-error text-sm mt-1">{errors.postalCode}</p>}
                </div>

                <div>
                    {/* champ ville */}
                    <label className="block text-sm font-medium text-on-surface mb-1">Ville *</label>
                    <FormField
                        placeholder="Paris"
                        currentValue={city}
                        onChange={(v) => setCity(String(v).replace(/[0-9]/g, '').slice(0, 50))}
                        required
                        disabled={isLoading || readOnly}
                        type="text"
                    />
                    {errors.city && <p className="text-error text-sm mt-1">{errors.city}</p>}
                </div>
            </div>

            <div className="mb-4">
                {/* champ pays */}
                <label className="block text-sm font-medium text-on-surface mb-1">Pays *</label>
                <FormField
                    placeholder="France"
                    currentValue={country}
                    onChange={(v) => setCountry(String(v).slice(0, 50))}
                    required
                    disabled={isLoading || readOnly}
                    type="text"
                />
                {errors.country && <p className="text-error text-sm mt-1">{errors.country}</p>}
            </div>

            <div className="mb-6 flex items-center">
                {/* case à cocher adresse principale */}
                <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimary}
                    onChange={(e) => !readOnly && setIsPrimary(e.target.checked)}
                    disabled={isLoading || readOnly}
                    className="w-4 h-4"
                />
                <label htmlFor="isPrimary" className="ml-2 text-sm text-on-surface">Définir comme adresse principale</label>
            </div>

            <div className="flex gap-3">
                {!readOnly && (
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-full hover:opacity-95 transition-opacity disabled:opacity-50 font-medium cursor-pointer address-submit"
                    >
                        {address ? 'Modifier' : 'Ajouter'}
                    </button>
                )}
                {/* bouton annuler / fermer */}
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 text-on-surface py-2 rounded-full hover:opacity-80 transition-colors disabled:opacity-50 font-medium cursor-pointer address-cancel"
                >
                    {readOnly ? 'Fermer' : 'Annuler'}
                </button>
            </div>
        </div>
    );
}

export default AddressForm;
