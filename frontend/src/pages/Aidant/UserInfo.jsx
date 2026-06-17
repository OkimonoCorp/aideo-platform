/* eslint-disable react-hooks/set-state-in-effect */
import React, {useState, useEffect, useRef} from 'react'
import IconButton from "../../components/IconButton.jsx";
import TextField from "../../components/TextField.jsx";
import Button from "../../components/Button.jsx";
import ProfilePhotoModal from "../../components/ProfilePhotoModal.jsx";
import LogoutIcon from '/icons/logout.svg?react';
import EditIcon from '/icons/edit.svg?react';
import AccountCircle from '/icons/account_circle.svg?react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import {GetBinary} from "../../util/APIUtils.js";
import {TOKEN_STORAGE_KEY} from "../../App.jsx";
import LightModeIcon from '/icons/light_mode.svg?react';
import DarkModeIcon from '/icons/dark_mode.svg?react';


function UserInfo({info, onEditInfo, logOutCallBack, accountDeletionCallback}) {
    const { theme, toggleTheme } = useTheme();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [oldPassword, setOldPassword] = useState('');

    // État pour la photo de profil
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
    const profileObjectUrlRef = useRef(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const capitalize = (s) => {
        if (!s) return '';
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    const normalizePhoneForState = (p) => {
        if (!p) return '';
        // remove spaces
        return p.replace(/\s+/g, '');
    }

    const formatPhoneDisplay = (p) => {
        if (!p) return '';
        const cleaned = p.replace(/\s+/g, '');

        const pair = (s) => s.match(/.{1,2}/g)?.join(' ') || s;

        if (cleaned.startsWith('+')) {
            // e.g. +33712345678 -> +33 7 12 34 56 78
            const withoutPlus = cleaned.slice(1);
            if (withoutPlus.startsWith('33')) {
                const rest = withoutPlus.slice(2); // e.g. 712345678
                if (rest.length === 0) return '+33';
                const first = rest.charAt(0);
                const others = rest.slice(1);
                return `+33 ${first}${others ? ' ' + pair(others) : ''}`.trim();
            }
            // generic: just group after plus
            return `+${pair(withoutPlus)}`;
        }

        if (cleaned.startsWith('0')) {
            // e.g. 0712345678 -> 07 12 34 56 78
            const firstTwo = cleaned.slice(0, 2);
            const rest = cleaned.slice(2);
            return `${firstTwo}${rest ? ' ' + pair(rest) : ''}`.trim();
        }

        // fallback: group in pairs
        return pair(cleaned);
    }


    // Récupération de la photo de profil
    const fetchProfilePhoto = () => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) {
            setProfilePhotoUrl(null);
            return;
        }

        // Révoquer l'ancienne URL si elle existe
        if (profileObjectUrlRef.current) {
            URL.revokeObjectURL(profileObjectUrlRef.current);
            profileObjectUrlRef.current = null;
        }

        GetBinary(`profile/photo_profil?t=${Date.now()}`, token,
            (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                profileObjectUrlRef.current = objectUrl;
                setProfilePhotoUrl(objectUrl);
            },
            () => {
                // En cas d'échec, afficher le logo par défaut
                setProfilePhotoUrl(null);
            }
        );
    };

    useEffect(() => {
        fetchProfilePhoto();

        return () => {
            if (profileObjectUrlRef.current) {
                URL.revokeObjectURL(profileObjectUrlRef.current);
            }
        };
    }, []);

    // On propage la variable info dans les différents champs
    const propagateInfo = (info) => {
        setFirstName(capitalize(info.prenom || ''));
        setLastName(capitalize(info.nom || ''));
        setEmail(info.email || '');
        setPhoneNumber(normalizePhoneForState(info.telephone || ''));
        setAddress(info.adresse || '');
    }

    // On propage les infos si on n'a pas encore d'email (indiquant que les champs sont vides)
    if (info && email === '') {
        // On propage les informations dans les champs
        propagateInfo(info);
    }

    // fonction qui vérifie si les informations ont été modifiées
    const isPhoneValid = (p) => {
        if (!p) return false;
        const cleaned = p.replace(/\s+/g, '');
        // format français : 0X XXXXXXXX (10 chiffres, commence par 01-09)
        if (/^0[1-9]\d{8}$/.test(cleaned)) return true;
        // format international : + suivi de 1 à 15 chiffres (norme E.164)
        if (/^\+\d{1,15}$/.test(cleaned)) return true;
        return false;
    }

    const verifyInfo = () => {
        if (!info) return false;
        const sameNames = firstName === (info.prenom ? capitalize(info.prenom) : '');
        const sameLast = lastName === (info.nom ? capitalize(info.nom) : '');
        const sameEmail = email === (info.email || '');
        const samePhone = phoneNumber === normalizePhoneForState(info.telephone || '');
        const sameAddress = address === (info.adresse || '');
        const oldPasswordEmpty = oldPassword === '';
        const newPasswordEmpty = newPassword === '';
        const confirmPasswordEmpty = confirmPassword === '';
        return sameNames && sameLast && sameEmail && samePhone && sameAddress && oldPasswordEmpty && newPasswordEmpty && confirmPasswordEmpty;
    }

    // fonction qui envoie les informations modifiées au backend
    // Le format est le suivant :
    // {
    //     "email": "aidant@test.com",
    //     "nom": "Dupont",
    //     "telephone": "0601010101",
    //     "prenom": "Jean",
    //     "pseudo": "SuperJean",
    //     "points": 100,
    //     "adresse": "10 Rue de la Paix, Paris"
    // }
    return (
        <>
            <div className={'flex flex-row w-full text-on-surface justify-between items-center px-4'}>
                <h1 className={'flex-1 min-w-0 '}>Informations Personnelles</h1>
                
                <div className={'flex flex-row items-center gap-3 flex-shrink-0'}>

                    {/* Theme toggle (mobile) */}
                    <div className="md:hidden">
                        <IconButton
                            className={'w-10 h-10'}
                            icon={theme === 'dark' ? <DarkModeIcon className="w-6 h-6 fill-current text-primary" /> : <LightModeIcon className="w-6 h-6 fill-current text-primary" />}
                            onClick={() => toggleTheme()}
                            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                        />
                    </div>

                    {/* Photo de profil (desktop uniquement) */}
                    <div
                        className={'hidden md:block relative cursor-pointer group flex-shrink-0 w-10 h-10'}
                        onClick={() => setIsPhotoModalOpen(true)}
                    >
                        {profilePhotoUrl ? (
                            <img
                                src={profilePhotoUrl}
                                alt="Photo de profil"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <AccountCircle className="w-10 h-10 fill-primary text-gray-800 dark:text-white"/>
                        )}
                        {/* Overlay avec crayon au hover */}
                        <div
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditIcon className="w-5 h-5 fill-white"/>
                        </div>
                    </div>
                    {/* Bouton de déconnexion */}
                    <IconButton
                        className={'logout-button w-10 h-10 flex-shrink-0'}
                        icon={<LogoutIcon className={'logout-icon-full fill-primary'}/>} 
                        route={'/'}
                        onClick={logOutCallBack}
                    />
                </div>
            </div>

            {/* Modal pour modifier la photo */}
            <ProfilePhotoModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onPhotoUpdated={fetchProfilePhoto}
            />

            {/* Photo de profil centrée (mobile uniquement) */}
            <div className="md:hidden flex justify-center mb-4">
                <div
                    className={'relative cursor-pointer group flex-shrink-0 w-10 h-10'}
                    onClick={() => setIsPhotoModalOpen(true)}
                >
                    {profilePhotoUrl ? (
                        <img
                            src={profilePhotoUrl}
                            alt="Photo de profil"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <AccountCircle className="w-10 h-10 fill-current text-gray-800 dark:text-white" />
                    )}
                    {/* Overlay avec crayon au hover */}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditIcon className="w-5 h-5 fill-white" />
                    </div>
                </div>
            </div>


            <div className={'flex flex-col justify-between w-full px-4'}>
                    <div className={'flex flex-col md:flex-row w-full mb-2 gap-2'}>
                        <div className={'w-full md:w-1/2 md:pr-2'}>
                            <TextField
                                name={'nom'}
                                label={'Nom'}
                                currentValue={lastName}
                                filter={'alpha'}
                                onChange={(e) => setLastName(capitalize(e.target.value))}
                            />
                        </div>
                        <div className={'w-full md:w-1/2 md:pl-2'}>
                            <TextField
                                name={'prenom'}
                                label={'Prénom'}
                                currentValue={firstName}
                                filter={'alpha'}
                                onChange={(e) => setFirstName(capitalize(e.target.value))}
                            />
                        </div>
                    </div>
                <div className={'flex flex-col md:flex-row w-full mb-2 gap-2'}>
                    <div className={'w-full md:w-1/2 md:pr-2'}>
                        <TextField
                            name={'email'}
                            label={'Adresse Mail'}
                            currentValue={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={'w-full md:w-1/2 md:pl-2'}>
                        <TextField
                            name={'telephone'}
                            label={'Numéro de Téléphone'}
                            currentValue={formatPhoneDisplay(phoneNumber)}
                            filter={'phone'}
                            onChange={(e) => setPhoneNumber(normalizePhoneForState(e.target.value))}
                        />
                        {phoneNumber && !isPhoneValid(phoneNumber) ? (
                            <div className={'text-sm text-error mt-1'}>Numéro invalide — utiliser 0X XX XX XX XX ou +XX
                                XXXX...</div>
                        ) : null}
                    </div>
                </div>
                <div className={'flex flex-col md:flex-row w-full mb-2 gap-2'}>
                    <div className={'w-full md:w-1/2 md:pr-2'}>
                        <TextField
                            name={'adresse'}
                            label={'Adresse'}
                            currentValue={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className={'flex flex-row w-full md:w-1/2 justify-end md:py-8'}>
                        <Button
                            text={'Supprimer le compte'}
                            activeStyle={'bg-error text-on-error hover:cursor-pointer'}
                            onClick={() => {
                                // Ouvre le modal de confirmation personnalisée
                                setDeleteError(null);
                                setDeletePassword('');
                                setIsDeleteModalOpen(true);
                            }}
                        />
                    </div>
                </div>

                {/* Column of password fields centered under the address */}
                <div className={'flex w-full justify-center mb-2'}>
                    <div className={'w-1/2 flex flex-col'}>
                        <TextField
                            label={'Ancien mot de passe'}
                            type={'password'}
                            currentValue={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                        />
                        <TextField
                            label={'Nouveau mot de passe'}
                            type={'password'}
                            currentValue={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className={'mt-2'}
                        />
                        <TextField
                            label={'Confirmer le mot de passe'}
                            type={'password'}
                            currentValue={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={'mt-2'}
                        />
                    </div>
                </div>

                <div className={'flex flex-row justify-center w-full mt-4'}>
                    <div className={'flex flex-row justify-end w-1/2'}>
                        <Button
                            className={'mr-2'}
                            text={'Annuler'}
                            active={!verifyInfo()}
                            activeStyle={'bg-error text-on-error'}
                            inactiveStyle={'bg-error text-on-error opacity-50 cursor-not-allowed'}
                            onClick={() => propagateInfo(info)}
                        />
                    </div>
                    <div className={'flex flex-row justify-start w-1/2'}>
                        <Button
                            className={'ml-2'}
                            text={'Enregistrer'}
                            active={!verifyInfo() && isPhoneValid(phoneNumber)}
                            activeStyle={'bg-primary text-on-primary'}
                            inactiveStyle={'bg-primary text-on-primary opacity-50 cursor-not-allowed'}
                            onClick={() => {
                                // onEditInfo retourne une Promise
                                onEditInfo({
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email,
                                    phoneNumber: phoneNumber,
                                    address: address,
                                    oldPassword: oldPassword,
                                    password: newPassword,
                                    confirmPassword: confirmPassword,
                                })
                                    .then(() => {
                                        // Si le changement de mot de passe a été demandé et a réussi,
                                        // on réinitialise les champs de mot de passe localement.
                                        if (newPassword && newPassword !== '') {
                                            setOldPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }
                                    })
                                    .catch(() => {
                                        alert('Une erreur est survenue lors de la sauvegarde des informations.');
                                    });
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal suppression compte */}
            {isDeleteModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => { if(!isDeleting) setIsDeleteModalOpen(false); }} />
                    <div className="bg-surface text-on-surface rounded-lg p-6 z-10 w-11/12 max-w-md">
                        <h2 className="text-lg font-semibold mb-2">Confirmer la suppression du compte</h2>
                        <p className="mb-4">Entrez votre mot de passe pour confirmer la suppression de votre compte. Cette action est irréversible.</p>

                        <div className="mb-3">
                            <label className="block text-sm mb-1">Mot de passe</label>
                            <input
                                type="password"
                                className="w-full rounded border px-3 py-2 bg-transparent text-on-surface"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                disabled={isDeleting}
                            />
                        </div>

                        {deleteError ? (
                            <div className="text-sm text-error mb-3">{deleteError}</div>
                        ) : null}

                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 rounded bg-gray-200 text-gray-800" onClick={() => { if(!isDeleting) setIsDeleteModalOpen(false); }} disabled={isDeleting}>Annuler</button>
                            <button
                                className="px-4 py-2 rounded bg-error text-on-error"
                                onClick={() => {
                                    // Lancer la suppression via le callback fourni par App.jsx
                                    setDeleteError(null);
                                    if (!deletePassword) {
                                        setDeleteError('Veuillez entrer votre mot de passe.');
                                        return;
                                    }
                                    setIsDeleting(true);
                                    accountDeletionCallback(deletePassword)
                                        .then(() => {
                                            //  suppression a réussi ; la fonction dans App.jsx effectuera le logout et la redirection
                                        })
                                        .catch((err) => {
                                            // err peut être un objet de la fonction Post; tenter d'en déduire le statut
                                            let status = err && err.status ? err.status : (err && err.response && err.response.status ? err.response.status : null);
                                            if (status === 403) {
                                                setDeleteError('Mot de passe incorrect.');
                                            } else {
                                                setDeleteError('Une erreur est survenue. Réessayez plus tard.');
                                            }
                                        })
                                        .finally(() => {
                                            setIsDeleting(false);
                                        });
                                }}
                                disabled={isDeleting}
                            >{isDeleting ? 'Suppression...' : 'Supprimer'}</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default UserInfo
