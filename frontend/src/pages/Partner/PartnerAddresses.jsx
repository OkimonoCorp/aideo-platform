import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AddressCard from '../../components/Partner/AddressCard.jsx';
import AddressForm from '../../components/Partner/AddressForm.jsx';
import {Put, Delete, Post} from '../../util/APIUtils.js';

function PartnerAddresses({ token, adresses, refreshProfile }) {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Synchroniser les adresses depuis les props
    useEffect(() => {
        if (adresses) {
            console.log('adresses prop:', adresses);
            const formattedAddresses = adresses.map(addr => ({
                id: addr.id,
                label: addr.adresse,
                street: addr.adresse,
                city: '',
                postalCode: '',
                country: 'France',
                isPrimary: false
            }));
            setAddresses(formattedAddresses);
        }
    }, [adresses]);

    const handleCreateOrUpdate = (formData) => {
        setIsLoading(true);
        const adresseText = `${formData.street}, ${formData.postalCode} ${formData.city}, ${formData.country}`;

        if (editingAddress) {
            // Modification d'une adresse existante : PUT sur profile/adresses/{id}
            Put('profile/adresses/' + editingAddress.id, token, { adresse: adresseText }, () => {
                setSuccessMessage('Adresse modifiée avec succès');
                try { localStorage.removeItem('address_draft'); } catch { /* ignore */ }
                setShowForm(false);
                setEditingAddress(null);
                setTimeout(() => setSuccessMessage(null), 3000);
                setIsLoading(false);
                if (refreshProfile) refreshProfile();
            }, () => {
                setError('Erreur lors de la modification de l\'adresse');
                setIsLoading(false);
            });
        } else {
            // Création d'une nouvelle adresse : PUT sur profile/adresses
            Post('profile/adresses', token, { adresse: adresseText }, () => {
                setSuccessMessage('Adresse créée avec succès');
                try { localStorage.removeItem('address_draft'); } catch { /* ignore */ }
                setShowForm(false);
                setEditingAddress(null);
                setTimeout(() => setSuccessMessage(null), 3000);
                setIsLoading(false);
                if (refreshProfile) refreshProfile();
            }, () => {
                setError('Erreur lors de la création de l\'adresse');
                setIsLoading(false);
            });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
            setIsLoading(true);
            Delete('profile/adresses/' + id, token, () => {
                setAddresses(prev => prev.filter(addr => addr.id !== id));
                setSuccessMessage('Adresse supprimée avec succès');
                setTimeout(() => setSuccessMessage(null), 3000);
                setIsLoading(false);
                if (refreshProfile) refreshProfile();
            }, () => {
                setError('Erreur lors de la suppression de l\'adresse');
                setIsLoading(false);
            });
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setShowForm(true);
    };


    const handleCloseForm = () => {
        setShowForm(false);
        setEditingAddress(null);
    };

    // La touche ESC ferme la popup lorsqu'elle est ouverte
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && showForm) {
                handleCloseForm();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showForm]);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-on-surface leading-tight">Mes adresses</h2>
                    {/* compteur adresses */}
                    <div className="text-sm text-on-surface-variant bg-surface-container h-7 flex items-center px-3 rounded-full border border-outline">
                        <span className="font-medium">{addresses.length}</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    disabled={isLoading || showForm}
                    className="bg-primary text-on-primary px-6 py-2 rounded-full hover:opacity-95 transition-opacity disabled:opacity-50 font-medium cursor-pointer"
                >
                    + Ajouter une adresse
                </button>
                {/* bouton ouvrir formulaire d'adresse */}
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

            {addresses.length > 0 && (
                <div className="mb-6">
                    {/* champ recherche adresses */}
                    <input
                        type="text"
                        placeholder="Rechercher une adresse..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center z-30" onClick={handleCloseForm}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="relative z-40 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        {/* modal adresse */}
                        <AddressForm
                            address={editingAddress}
                            onSubmit={handleCreateOrUpdate}
                            onCancel={handleCloseForm}
                            isLoading={isLoading}
                            draftKey={'address_draft'}
                        />
                    </div>
                </div>
            )}

            {isLoading && !showForm && <LoadingSpinner />}

            {!isLoading && addresses.length === 0 && !showForm && (
                <div className="text-center py-12 bg-surface-container rounded-3xl shadow-inner">
                    <p className="text-on-surface text-lg">Aucune adresse enregistrée pour le moment.</p>
                    <p className="text-on-surface-variant text-sm mt-2">Ajoutez votre première adresse !</p>
                </div>
            )}

            <div className="space-y-4">
                {/* carte adresse */}
                {adresses.map(address => (
                    <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </div>
    );
}

export default PartnerAddresses;
