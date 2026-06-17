import React, { useState } from 'react';
import TextField from '../TextField.jsx';
import TextArea from '../TextArea.jsx';
import Button from '../Button.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';

/**
 * Composant modal/formulaire pour créer ou modifier un avantage
 */
function AdvantageForm({ advantage = null, onSubmit, onCancel, isLoading = false, readOnly = false, draftKey = null }) {
    const [title, setTitle] = useState(advantage?.title || '');
    const [description, setDescription] = useState(advantage?.description || '');
    const [errors, setErrors] = useState({});

    // Charger le brouillon depuis localStorage si fourni et en l'absence de la prop advantage (création)
    React.useEffect(() => {
        if (!advantage && draftKey) {
            try {
                const raw = localStorage.getItem(draftKey);
                if (raw) {
                    const draft = JSON.parse(raw);
                    if (draft.title) setTitle(draft.title);
                    if (draft.description) setDescription(draft.description);
                }
            } catch (e) {
                // ignore
            }
        }
    }, [advantage, draftKey]);

    // Sauvegarde différée pour éviter les problèmes de focus sur les champs
    React.useEffect(() => {
        if (readOnly || !draftKey) return;
        const id = setTimeout(() => {
            try {
                const draft = { title, description };
                localStorage.setItem(draftKey, JSON.stringify(draft));
            } catch (e) {
                // ignorer
            }
        }, 300);
        return () => clearTimeout(id);
    }, [title, description, draftKey, readOnly]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!title.trim()) {
            newErrors.title = 'Le nom de l\'avantage est requis';
        }
        
        if (!description.trim()) {
            newErrors.description = 'La description est requise';
        }
        
        // Les points sont attribués par l'admin, pas par le partenaire lors de la création.
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit({
                title: title.trim(),
                description: description.trim()
            });

            // supprimer le brouillon après soumission réussie
            if (draftKey) {
                try { localStorage.removeItem(draftKey); } catch (e) {}
            }
        }
    };

    return (
        <div className="bg-surface-container-high backdrop-blur-md rounded-3xl shadow-lg p-8 max-w-md w-full border border-outline-variant">
            <h2 className="text-2xl font-bold mb-6 text-on-surface">
                {readOnly ? 'Afficher l\'avantage' : (advantage ? 'Modifier l\'avantage' : 'Nouvel avantage')}
            </h2>

            {isLoading && <LoadingSpinner />}

            <div className="mb-4">
                {/* champ titre avantage */}
                <label className="block text-sm font-medium text-on-surface mb-1">
                    Nom de l'avantage *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading || readOnly}
                    className={`w-full px-3 py-2 rounded-lg shadow-inner focus:outline-none focus:ring-2 bg-surface text-on-surface ${
                        errors.title ? 'ring-1 ring-error' : 'ring-1 ring-outline'
                    }`}
                    placeholder="Ex: Remise 10%"
                />
                {errors.title && <p className="text-error text-sm mt-1">{errors.title}</p>}
            </div>

            <div className="mb-4">
                {/* champ description avantage */}
                <label className="block text-sm font-medium text-on-surface mb-1">
                    Description *
                </label>
                {readOnly ? (
                    <div className="w-full px-3 py-2 border rounded-lg bg-surface-container overflow-auto whitespace-pre-wrap">
                        {description}
                    </div>
                ) : (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                        disabled={isLoading || readOnly}
                        rows="4"
                        maxLength={1000}
                        className={`w-full px-3 py-2 rounded-lg shadow-inner focus:outline-none focus:ring-2 resize-none bg-surface text-on-surface ${
                            errors.description ? 'ring-1 ring-error' : 'ring-1 ring-outline'
                        }`}
                        placeholder="Décrivez l'avantage offert..."
                    />
                )}
                {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
            </div>

            {readOnly && advantage?.pointsAssigned && (
                <div className="mb-4">
                    {/* affichage points attribués (lecture seule) */}
                    <span className="inline-block bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-sm font-medium">
                        {advantage.pointsAssigned} points attribués
                    </span>
                </div>
            )}

            <div className="flex gap-3">
                {!readOnly && (
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-full hover:opacity-95 transition-opacity disabled:opacity-50 font-medium text-white"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        Ajouter
                    </button>
                )}
                {/* bouton annuler / fermer */}
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 text-on-surface py-2 rounded-full hover:opacity-80 transition-colors disabled:opacity-50 font-medium border border-outline"
                    style={{ backgroundColor: 'var(--color-surface-container-highest)' }}
                >
                    {readOnly ? 'Fermer' : 'Annuler'}
                </button>
            </div>
        </div>
    );
}

export default AdvantageForm;
