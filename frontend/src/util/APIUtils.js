import axios from "axios";
import {TOKEN_STORAGE_KEY} from "../App.jsx";

const DEV = false; // Mettre à false en production

// URL de base de l'API en fonction de l'environnement
const API_BASE_URL = `http${DEV ? '' : 's'}://${DEV ? 'localhost:8000' : 'apiaideo.navilink.fr'}/api/`

// Fonction pour effectuer une requête GET à l'API
export function Get(endpoint, token, onSuccess = () => {
}, onFailure) {
    let headers = getHeaders(token);
    axios.get(API_BASE_URL + endpoint, {
        headers: headers,
    })
        .then(res => {
            onSuccess(res.data)
        })
        .catch(err => {
            handleApiError(err,undefined, onFailure);
        });
}

// Fonction pour effectuer une requête POST à l'API
export function Post(endpoint, token, data = {}, onSuccess = () => {
}, onFailure) {
    let headers = getHeaders(token);
    axios.post(API_BASE_URL + endpoint, data, {
        headers: headers,
    })
        .then(res => {
            onSuccess(res.data)
        })
        .catch(err => {
            handleApiError(err,undefined, onFailure)
        });
}

// Fonction pour effectuer une requête PUT à l'API
export function Put(endpoint, token, data = {}, onSuccess = () => {
}, onFailure) {
    let headers = getHeaders(token);
    axios.put(API_BASE_URL + endpoint, data, {
        headers: headers,
    })
        .then(res => {
            onSuccess(res.data)
        })
        .catch(err => {
            handleApiError(err,undefined, onFailure)
        });
}

// Fonction pour effectuer une requête DELETE à l'API
export function Delete(endpoint, token, onSuccess = () => {
}, onFailure) {
    let headers = getHeaders(token);
    axios.delete(API_BASE_URL + endpoint, {
        headers: headers,
    })
        .then(res => {
            onSuccess(res.data)
        })
        .catch(err => {
            handleApiError(err,undefined, onFailure)
        });
}

// Fonction pour effectuer une requête PATCH à l'API
export function Patch(endpoint, token, data = {}, onSuccess = () => {
}, onFailure) {
    let headers = getHeaders(token);
    axios.patch(API_BASE_URL + endpoint, data, {
        headers: headers,
    })
        .then(res => {
            onSuccess(res.data)
        })
        .catch(err => {
            handleApiError(err,undefined, onFailure)
        });
}

// Récupérer des données binaires (image/blob) depuis l'API
// Utilisation : GetBinary('photo_profil', token, (blob) => { ... }, () => { ... })
export function GetBinary(endpoint, token, onSuccess = () => {
}, onFailure) {
    let headers = getHeaders(token);
    axios.get(API_BASE_URL + endpoint, {
        headers: headers,
        responseType: 'blob',
        validateStatus: (status) => {
            // Accepter 200 (OK) et 204 (No Content) comme des succès
            return status === 200 || status === 204;
        }
    })
        .then(res => {
            if (res.status === 204 || !res.data || res.data.size === 0) {
                // Pas de contenu = pas de photo
                onFailure();
            } else {
                onSuccess(res.data);
            }
        })
        .catch(err => {
            console.error(err);
            //Dire que la photo est absente en cas d'erreur
            handleApiError(err, "Impossible de récupérer les données.", onFailure)
        });
}

// Fonction utilitaire pour obtenir les en-têtes avec le token d'authentification
function getHeaders(token) {
    return token ? {Authorization: `Bearer ${token}`} : {};
}

function checkTokenValidity(response) {
    return !(response?.status === 401 && response?.data?.message === 'Expired JWT Token');
}

// Fonction pour déconner l'utilisateur
function handleApiError(error, message, onFailure) {
    if (!checkTokenValidity(error.response)) {
        // Le token a expiré, il faut avertir et déconnecter l'utilisateur.
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.location.reload();
        return;
    }

    // Appeler la fonction onFailure si elle est fournie.
    if (onFailure) {
        try {
            onFailure(error);
        } catch (e) {
            console.error('Un problème est survenu avec l\'appel de onFailure', e);
        }
    } else {
        console.error(error)
        // Prévenir l'utilisateur.
        alert(message || "Un problème est survenu. Veuillez réessayer plus tard.");
    }
}