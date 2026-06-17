import './style.css'
import {Route, Routes, Navigate, useNavigate} from "react-router-dom";
import Layout from "./components/Layout.jsx";
import UserInfo from "./pages/Aidant/UserInfo.jsx";
import MyNotes from './pages/Aidant/MyNotes.jsx';
import Messages from "./pages/Aidant/Messages.jsx";
import MarketPlace from './pages/Aidant/MarketPlace.jsx';
import Map from './pages/Aidant/Map.jsx';
import {useState} from "react";
import Calendar from "./pages/Aidant/Calendar.jsx";
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from './pages/NotFound';
import MentionsLegales from "./pages/MentionsLegales.jsx";
import Confidentialite from "./pages/Confidentialite.jsx";
import {Get, Post, Put} from "./util/APIUtils.js";
import {ThemeProvider} from './contexts/ThemeContext.jsx';
import PartnerCompany from "./pages/Partner/PartnerCompany.jsx";
import PartnerAdvantages from "./pages/Partner/PartnerAdvantages.jsx";
import PartnerAddresses from "./pages/Partner/PartnerAddresses.jsx";
import AdminPage from "./pages/Admin/AdminPage.jsx";

export const TOKEN_STORAGE_KEY = 'token';

function App() {
    const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY));
    const [userRole, setUserRole] = useState()
    const [defaultPage, setDefaultPage] = useState()

    const nav = useNavigate();

    const [info, setInfo] = useState();
    const [coords, setCoords] = useState()
    const [points, setPoints] = useState()

    function getDefaultPage() {
        return userRole === 'aidant' ? '/map' : '/advantages';
    }

    function parseJwt(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    // Fonction pour créer un compte et récupérer le token.
    function register(formData) {
        Post("creer_compte", undefined, formData, () => {
            nav('/login', {replace: true})
        })
    }

    // Fonction pour se connecter et récupérer le token.
    // 'onSuccess' est la fonction à appeler une fois le token récupéré et le login validé.
    // 'onFailure' est la fonction à appeler en cas d'échec du login.
    function login(email, password, onSuccess, onFailure) {
        Post('login', undefined, {
                email: email,
                password: password
            },
            (data) => {
                localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
                setToken(data.token)
                onSuccess()
            },
            onFailure);
    }

    function updateCoords(address) {
        // On utilise l'API de Nominatim pour géocoder l'adresse
        // Uniquement si l'adresse a changé et qu'elle n'est pas vide.
        let prevAddress = info ? info.adresse : ''
        if (address && address !== '' && address !== prevAddress) {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lng = parseFloat(data[0].lon);
                        setCoords([lat, lng])
                    }
                })
                .catch(err => {
                    console.error("Erreur géocodage initial:", err);
                });
        } else {
            setCoords([48.8566, 2.3522])
        }
    }

    function fetchInfo() {
        Get('profile', token, (data) => {
            // On trouve le rôle de l'utilisateur à partir du token
            let role = parseJwt(token).roles.some(role => role === 'ROLE_AIDANT') ? 'aidant' : 'partenaire';
            setUserRole(role);

            // Dans le cas des partenaires, on récupère les adresses en tant que tableau
            if (role === 'partenaire') {
                console.log(data)
                // data.adresses = []
            }

            // On récupère les informations de l'utilisateur (nom, prénom, email, téléphone, adresse)
            // Et on remplace les informations nulles par des chaînes vides.
            setInfo(Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value || ''])));


            // On calcule l'adresse et on affecte les points seulement si c'est un aidant
            if (role === 'aidant') {
                updateCoords(data.adresse)
                setPoints(data.points)
            }
        })
    }

    // Si on a un token, mais pas encore les infos, on les récupère
    if (token) {
        if (!info) {
            fetchInfo()
        } // Sinon, si on a le role mais pas encore la page par défaut, on la calcule
        else if (!defaultPage) {
            setDefaultPage(getDefaultPage())
        }
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
    function onEditInfo(newInfo) {
        // Retourne une Promise qui résout lorsque toutes les opérations (mot de passe et profil) ont terminé
        return new Promise((resolve, reject) => {
            if (!newInfo) {
                resolve();
                return;
            }

            // Si un nouveau mot de passe est fourni, on tente de le changer d'abord
            if (newInfo.password && newInfo.password !== '') {
                if (!newInfo.confirmPassword || newInfo.confirmPassword === '') {
                    alert("Veuillez confirmer le nouveau mot de passe.");
                    reject({message: 'confirm_missing'});
                    return;
                }
                if (newInfo.password !== newInfo.confirmPassword) {
                    alert("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
                    reject({message: 'mismatch'});
                    return;
                }

                Post('password_modif', token, {
                    old_password: newInfo.oldPassword,
                    new_password: newInfo.password
                }, () => {
                    // Mot de passe changé avec succès
                    alert("Mot de passe modifié avec succès.");
                }, (err) => {
                    // transmettre l'erreur au caller
                    reject(err);
                })
            }

            // On met à jour les autres informations du profil
            Put('profile', token, {
                nom: newInfo.lastName,
                prenom: newInfo.firstName,
                email: newInfo.email,
                pseudo: "",
                telephone: newInfo.phoneNumber,
                adresse: newInfo.address,
            }, () => {
                // On met à jour les informations locales
                setInfo({
                    nom: newInfo.lastName,
                    prenom: newInfo.firstName,
                    email: newInfo.email,
                    pseudo: "",
                    telephone: newInfo.phoneNumber,
                    adresse: newInfo.address
                })

                // On recalcule les coordonnées de l'adresse si c'est un aidant
                // (La carte n'a besoin d'être affichée que pour les aidants)
                if (userRole === 'aidant') {
                    updateCoords(newInfo.address)
                }
                resolve();
            }, (err) => {
                // rejette si PUT échoue
                reject(err);
            })
        });
    }

    function handleLogOut() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(undefined)

        setInfo(undefined)
        setUserRole(undefined)
        setDefaultPage(undefined)
    }

    function handleAccountDeletion(password) {
        // Retourne une Promise afin que le composant appelant puisse gérer les erreurs (403 mot de passe incorrect)
        return new Promise((resolve, reject) => {
            if (!password) {
                // Rejette immédiatement si aucun mot de passe fourni
                reject({status: 400, error: 'Mot de passe requis'});
                return;
            }

            Post('supprimer_compte', token, {password: password}, () => {
                // Succès : on déconnecte l'utilisateur
                handleLogOut();
                nav('/')
                resolve();
            }, (err) => {
                // Propager l'erreur brute au composant appelant pour qu'il puisse afficher un message adapté
                // Le format de `err` dépend de la fonction Post; on transfère tel quel
                reject(err);
            });
        });
    }

    return (
        <ThemeProvider>
            <Routes>
                {/*Contenu principal du site*/}

                {/* On ne va sur la page d'accueil que si on n'a pas encore enregistré de token dans le localstorage */}
                <Route path="/" element={token ? <Navigate to={defaultPage} replace/> : <HomePage/>}/>
                <Route path="*" element={<NotFound/>}/>

                <Route path={"/login"} element={
                    // On ne va sur la page de login que si on n'a pas encore enregistré de token dans le localstorage
                    token ?
                        <Navigate to={defaultPage} replace/> :
                        <Login loginCallback={login}/>}
                />
                <Route path={"/register"} element={<Register createAccountCallback={register}/>}/>
                <Route path={"/mentions-legales"} element={<MentionsLegales/>}/>
                <Route path={"/confidentialite"} element={<Confidentialite/>}/>

                <Route element={token ? <Layout role={userRole} bgStyle={'bg-inverse-primary'}/> :
                    <Navigate to={"/login"} replace/>}>
                    {userRole === 'aidant' ?
                        // Routes Aidant
                        <>
                            <Route path={"/info"} element={
                                // Page d'informations utilisateur
                                <UserInfo info={info} onEditInfo={onEditInfo} logOutCallBack={handleLogOut}
                                          accountDeletionCallback={handleAccountDeletion}/>
                            }/>
                            <Route path={"/notes"} element={
                                // Page pour les notes de l'utilisateur
                                <MyNotes/>
                            }/>
                            <Route path={"/map"} element={
                                // Page de la carte
                                <Map token={token} mapCenter={coords}/>
                            }/>
                            <Route path={"/messages"} element={
                                // Page de la messagerie (historique de discussions)
                                <Messages token={token}/>
                            }/>
                            <Route path={"/marketplace"} element={
                                // Page pour acheter des avantages avec les points
                                <MarketPlace token={token} userPoints={points} refreshPointsCallback={fetchInfo}/>
                            }/>
                            <Route path={"/calendar"} element={
                                // Page du calendrier (emploi du temps -> liste des tâches à faire par semaine, etc.)
                                <Calendar token={token}/>
                            }/>
                        </>
                        : (userRole === 'partenaire' ?
                            // Routes partenaire
                            <>
                                <Route path="company" element={
                                    // Informations sur l'entreprise partenaire
                                    <PartnerCompany token={token} logoutCallback={handleLogOut}/>
                                }/>
                                <Route path="advantages" element={
                                    // Gestion des avantages proposés par le partenaire
                                    <PartnerAdvantages token={token}/>}
                                />
                                <Route path="addresses" element={
                                    // Gestion des adresses du partenaire
                                    <PartnerAddresses token={token} adresses={info.adresses}/>}
                                />
                            </>
                            : (userRole === 'mod' &&
                                // Routes modérateur
                                <>
                                    <Route path={"/admin"} element={<AdminPage token={token}/>}/>
                                </>
                            ))
                    }
                </Route>
            </Routes>
        </ThemeProvider>
    )
}

export default App
