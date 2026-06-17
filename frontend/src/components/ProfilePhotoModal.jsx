import React, { useState, useRef } from 'react';
import { TOKEN_STORAGE_KEY } from '../App.jsx';
import CloseIcon from '/icons/close.svg?react';
import {Post} from "../util/APIUtils.js";

function ProfilePhotoModal({ isOpen, onClose, onPhotoUpdated }) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = () => {
        if (!file) return;

        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) return;

        const formData = new FormData();
        formData.append('photo', file);

        setIsUploading(true);
        Post('profile/photo_profil', token, formData,
            () => {
                setIsUploading(false);
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
                setFile(null);
                onPhotoUpdated();
                onClose();
            },
            () => {
                setIsUploading(false);
                alert('Erreur lors de l\'upload de la photo');
            }
        );
    };

    const handleClose = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setFile(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Modifier la photo de profil</h2>
                    <button onClick={handleClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                        ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {preview ? (
                        <img src={preview} alt="Aperçu" className="w-32 h-32 rounded-full object-cover mx-auto" />
                    ) : (
                        <div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Glissez-déposez une image ici (2Mo max)
                            </p>
                            <p className="text-gray-400 text-sm">ou cliquez pour sélectionner</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>

                {file && (
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            Annuler
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Envoi...' : 'Enregistrer'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePhotoModal;

