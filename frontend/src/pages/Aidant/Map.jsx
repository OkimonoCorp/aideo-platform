import "leaflet/dist/leaflet.css";
import React, {useState, useRef, useEffect} from 'react';
import {MapContainer, TileLayer, Marker, Popup, useMapEvents} from 'react-leaflet';
import {Icon, divIcon, point} from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import CardMap from "../../components/CardMap";
import TextField from "../../components/TextField";
import locationIconPath from "/icons/location_on.svg";
import {Put, Post, Delete, Get} from "../../util/APIUtils.js";
import { useTheme } from '../../contexts/ThemeContext.jsx';

const customIcon = new Icon({
    iconUrl: locationIconPath,
    iconSize: [38, 38], // pixels
});

/**
 * Fonction qui permet tous les affichages de la carte interactive
 * @param token les informations qui sont nécessaires à la gestion d'une session
 * @param mapCenter le centre de la carte
 * @returns {React.JSX.Element}
 */
function Map({token, mapCenter= [48.8566, 2.3522]}) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [allMarkers, setAllMarkers] = useState([]);
    const [mapBounds, setMapBounds] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddingService, setIsAddingService] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showErrorForm, setShowErrorForm] = useState(false);
    const [viewRadius, setViewRadius] = useState(0);
    const [tempCoords, setTempCoords] = useState(null);
    const [map, setMap] = useState(null);
    const markerRefs = useRef({});
    const clusterRef = useRef(null);
    const [currentCenter, setCurrentCenter] = useState({lat: 48.8566, lng: 2.3522});
    const [isEditing, setIsEditing] = useState(false);
    const [currentServiceId, setCurrentServiceId] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [isLocationSelected, setIsLocationSelected] = useState(false);


    /**
     * état du formulaire par defaut
     */
    const [newService, setNewService] = useState({
        type: "proposition",
        title: "",
        description: "",
        maxDemandeurs: 1,
        date: "",
        duree: 0
    });

    /**
     * Permet de fermer le formulaire
     */
    const closeForm = () => {
        setShowForm(false);// le formulaire se ferme
        setIsEditing(false);// on n'est plus en train de modifier un service
        setCurrentServiceId(null);
        // Set les données préremplie pour le prochain formulaire
        setNewService({
            type: "proposition",
            title: "",
            description: "",
            maxDemandeurs: 1,
            date: "",
            durre: 60
        });
    };

    /**
     * Sert à formater la date et l'heure d'un service pour que l'affichage soit propre et rescpect les affichages usuels
     * @param dateString est une date
     * @returns {*|string|null} null quand il a pas de date. Et une date formaté quand il y a une date
     */
    const formatServiceDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date)) return dateString; // Retourne la date brute si le format est inconnu

        // formate l'heure
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(':', 'h').replace(' ', ' à ');// remplace les : par des h et les ' ' par des à
    };

    /**
     * Sert à convertir la duree du service en minute (pour l'envoyer au backend)
     * @param valeur est l'heure du service
     * @param type permet de savoir si c'est des heures ou des minutes
     */
    const convertMinute = (valeur, type) => {
        // On autorise toujours la suppression (chaîne vide)
        if (valeur === "") {
            const heuresActuelles = Math.floor((newService.duree || 0) / 60);
            const minutesActuelles = (newService.duree || 0) % 60;
            const nouveauTotal = type === 'h' ? minutesActuelles : heuresActuelles * 60;
            setNewService({...newService, duree: nouveauTotal});
            return;
        }

        if (valeur.length > 2) return;
        let valNumerique = parseInt(valeur);
        if (type === 'm' && valNumerique > 59) valNumerique = 59;// si c'est des minutes ce ne peut pas être au dessus de 59

        // calcul de la limite jusqu'à minuit
        let limiteMinutesMax = 1440; // Par défaut 24h (si pas de date saisie)

        if (newService.date) {
            // heure de début du service
            const heureDebutMatch = newService.date.split('T')[1]; // Récupère "HH:mm"
            if (heureDebutMatch) {
                const [hDebut, mDebut] = heureDebutMatch.split(':').map(Number);
                const minutesEcouleesDansLaJournee = (hDebut * 60) + mDebut;

                // La durée max est le temps restant avant 1440 minutes (24h00)
                limiteMinutesMax = 1440 - minutesEcouleesDansLaJournee;
            }
        }

        const heuresActuelles = Math.floor((newService.duree || 0) / 60);
        const minutesActuelles = (newService.duree || 0) % 60;

        let nouveauTotal = 0;
        if (type === 'h') {
            nouveauTotal = (valNumerique * 60) + minutesActuelles;
        } else {
            nouveauTotal = (heuresActuelles * 60) + valNumerique;
        }


        // Si le total dépasse la limite, on bloque ou on plafonne
        if (nouveauTotal > limiteMinutesMax) {
            nouveauTotal = limiteMinutesMax;
        }

        setNewService({...newService, duree: nouveauTotal});
    };

    /**
     * Permet d'avoir la durée max pour un service (une tache ne peut aller sur plusieurs jours)
     * @returns {React.JSX.Element|null}
     */
    const getDurationLimitLabel = () => {
        if (!newService.date) return null;

        const heureDebutMatch = newService.date.split('T')[1];
        if (!heureDebutMatch) return null;

        const [hDebut, mDebut] = heureDebutMatch.split(':').map(Number);
        const limiteMinutes = 1440 - ((hDebut * 60) + mDebut);

        const hMax = Math.floor(limiteMinutes / 60);
        const mMax = limiteMinutes % 60;

        return (
            <span className="text-xs font-bold text-error uppercase">
            (Max : {hMax}h{mMax > 0 ? mMax : ''})
        </span>
        );
    };

    /**
     * Est appelé à chaque mouvement de la carte et permet d'afficher ou non des services
     */
    useEffect(() => {
        let isMounted = true;// Drapeau (une variable booléenne) utilisé pour savoir si un composant est toujours présent à l'écran ou s'il a été détruit

        if (token && viewRadius > 0) {
            // On appelle l'API et on lui donne des informations
            Post('services/map', token, {
                latitude: currentCenter.lat,
                longitude: currentCenter.lng,
                rayon: viewRadius
            }, async (data) => {
                // l'API nous renvoie deux listes, une avec les services qui nous appartiennent et une avec ceux qui ne nous appartiennent pas
                if (data && data.userServices && data.otherServices) {

                    // Les services qu'on va afficher
                    const mapServiceToMarker = async (service, isUserService) => {
                        // On récupère l'id de la tache qui est contenu dans le service
                        const idService = service.id;
                        let date = "";
                        let duree = 0;
                        let listeCandidats = [];

                        // Si une tâche existe, on va chercher ses détails
                        if (idService) {
                            await new Promise((resolve) => {
                                Get(`services/${idService}`, token, (serviceData) => {

                                    console.log(serviceData.service.candidats)
                                    if (serviceData && serviceData.service.tache.date) {
                                        date = serviceData.service.tache.date;
                                        duree = serviceData.service.tache.duree;
                                        listeCandidats = serviceData.service.candidats;
                                    }
                                    resolve();
                                }, () => {
                                    console.error(`Erreur sur la tâche ${idService}`);
                                    resolve();
                                });
                            });
                        }

                        return {
                            ...service,
                            id: service.id,
                            idTache: service.idTache|| service.tache.id || service.tacheId,
                            idCreateur: service.idCreateur,
                            isUserService: isUserService,
                            date: date,
                            duree: duree,
                            geocode: [service.latitude, service.longitude],
                            totalCandidat: service.totalCandidat || 0,
                            maxDemandeurs: service.maxDemandeurs,
                            estInscrit: !isUserService && !!service.estInscrit,
                            pouce: !isUserService && !!service.estInscrit,
                            nom: service.nom,
                            description: service.description,
                            type: service.type,
                            candidats: listeCandidats,
                        }};

                    // On transforme tous les services en promesses
                    // (les promesses permettent de lancer toutes les requêtes d'un coup plutôt que d'attendre la fin de la première pour lancer la seconde)
                    // et on attend qu'elles soient résolues
                    const [userMarkers, otherMarkers] = await Promise.all([
                        Promise.all(data.userServices.map(s => mapServiceToMarker(s, true))),
                        Promise.all(data.otherServices.map(s => mapServiceToMarker(s, false)))
                    ]);

                    if (isMounted) {
                        setAllMarkers([...userMarkers, ...otherMarkers]);
                    }
                }
            }, (err) => {
                console.error("Erreur lors de la récupération des services", err);
                setShowErrorForm(true);
            });
        }
        return () => { isMounted = false; }; // On met le drapeau à false quand tous les appels d'API ont été fait sans encombre
    }, [currentCenter.lat, currentCenter.lng, viewRadius, token]);// Dès qu'une de ces données change la fonction est rappelé

    /**
     * Permet d'ajouter/modifier un service
     */
    const saveService = () => {
        // Les informations obligatoire pour un service
        if (!newService.title) return alert("Veuillez remplir le Titre");
        if(!newService.duree || newService.duree === 0) return alert(("Veuillez indiquer la durée du service."));
        if(!newService.date ) return alert(("Veuillez indiquer une date et une heure pour le service."));

        // Les données qu'on va envoyer à l'API
        const serviceData = {
            nom: newService.title,
            description: newService.description,
            latitude: tempCoords.lat,
            longitude: tempCoords.lng,
            type: newService.type,
            date: newService.date.replace("T", " "),
            duree: newService.duree,
            maxDemandeurs: newService.maxDemandeurs, // Correction du nom du champ
        };

        // Si on modifie un service
        if (isEditing) {

            // --- LOGIQUE DE MISE À JOUR DE LA TÂCHE ---
            // On récupère l'idTache stocké dans le marqueur actuel
            const currentMarker = allMarkers.find(m => String(m.id) === String(currentServiceId));
            const idTache = currentMarker?.idTache;

            if (!idTache) return alert("Erreur : ID de tâche introuvable");

            // Appel pour mettre à jour un service
            Put(`taches/${idTache}`, token, serviceData, (updatedData) => {

                // Mise à jour de l'état local pour refléter les changements sur la liste
                setAllMarkers(prev => prev.map(m => {
                    if (m.id === currentServiceId) {
                        return {
                            ...m,
                            ...updatedData,
                            nom: serviceData.nom,
                            description: serviceData.description,
                            date: serviceData.date.replace("T", " "),
                            duree: serviceData.duree,
                            maxDemandeurs: serviceData.maxDemandeurs,
                            type: serviceData.type,
                            geocode: [serviceData.latitude, serviceData.longitude],
                            candidats: serviceData.candidats,
                        };
                    }
                    return m;
                }));

                closeForm();
            }, (err) => {
                console.error("Erreur lors de la modification", err);
            });
        }else { // on ajoute un service
            Post('services', token, serviceData, (savedService) => {

                const markerToAdd = {
                    ...savedService,
                    nom: serviceData.nom,
                    description: serviceData.description,
                    type: serviceData.type,
                    maxDemandeurs: serviceData.maxDemandeurs,
                    geocode: [tempCoords.lat, tempCoords.lng],
                    date: serviceData.date.replace("T", " "),
                    duree: serviceData.duree,
                    isUserService: true,
                    totalCandidat: 0,
                    candidats: [],
                    estInscrit: false,
                    pouce: false
                };
                setAllMarkers(prev => [...prev, markerToAdd]);
                closeForm();
            });
        }
    };

    /**
     * Permet de supprimer un service
     * @param serviceId le service que l'on veut supprimer
     */
    const deleteService = (serviceId) => {

        // Suppression de la BDD
        Delete(`services/${serviceId}`, token, () => {

            // Mise à jour de l'interface : on filtre les marqueurs pour enlever celui supprimé
            setAllMarkers(prevMarkers =>
                prevMarkers.filter(marker => marker.id !== serviceId)
            );

            // Si une popup était ouverte, Leaflet(librairie de la carte) la fermera automatiquement
            // car le composant Marker va être démonté.
        }, (err) => {
            console.error("Erreur lors de la suppression :", err);
        });
    };

    /**
     * Permet d'ouvrir le formulaire avec les données correspondant au service que l'on veut modifier
     * @param service le service qu'on veut modifier
     */
    const editService = (service) => {

        const datePourFormulaire = service.date
            ? service.date.substring(0, 16).replace(" ", "T")
            : "";

        //  les données du service
        setNewService({
            type: service.type || "proposition",
            title: service.nom || "",
            description: service.description || "",
            maxDemandeurs: service.maxDemandeurs || 1,
            date: datePourFormulaire,
            duree: service.duree,
        });
        setTempCoords({ lat: service.geocode[0], lng: service.geocode[1] });
        setCurrentServiceId(service.id);
        setIsEditing(true);
        setShowForm(true);
    };

    /**
     * Permet de gérer les mouvements (et le zoom) de la carte
     * @param onUpdate sert à connaitre le rayon et la distance entre le centre de la carte et le coin en haut à gauche
     * @param onBoundsChange sert à connaitre les nouvelles limites visibles de la carte
     */
    function MapInfoHandler({onUpdate, onBoundsChange}) {

        const map = useMapEvents({
            moveend() {
                const center = map.getCenter();
                const bounds = map.getBounds();
                const distanceMetres = center.distanceTo(bounds.getNorthWest());

                setCurrentCenter(prev => {
                    if (prev.lat === center.lat && prev.lng === center.lng) return prev;
                    return { lat: center.lat, lng: center.lng };
                });
                onUpdate(distanceMetres);
                onBoundsChange(bounds);
            },
        });
        return null;
    }

    /**
     * Permet d'ajouter un inscris sur un service et de l'afficher instantanément sur la carte dès que l'utilisateur clique sur "S'inscrire"(proposition),
     * sans attendre que la base de données réponde
     * @param serviceId le service auquelle on vient de s'inscrire
     */
    const addLocalProposition = (serviceId) => {
        // on récupère l'ancienne liste des services pour pouvoir la modifier
        setAllMarkers(prev => prev.map(m => {
            if (m.id === serviceId) {
                return {
                    ...m,
                    estInscrit: true,
                    totalCandidat: (m.totalCandidat || 0) + 1,
                    // On ajoute un objet candidat fictif pour que le bouton de validation
                    // apparaisse ou que le calcul des points soit possible
                    candidats: [...(m.candidats || [])]
                };
            }
            return m;
        }));
    };

    /**
     * Permet d'enlever un inscris sur un service et de l'afficher instantanément sur la carte dès que l'utilisateur clique sur "Se désinscrire"(proposition),
     * sans attendre que la base de données réponde
     * @param serviceId le service auquelle on vient de se désinscrire
     */
    const removeLocalProposition = (serviceId) => {
        // on récupère l'ancienne liste des services pour pouvoir la modifier
        setAllMarkers(prev => prev.map(m => {
            if (m.id === serviceId) {
                return {
                    ...m,
                    estInscrit: false,
                    totalCandidat: Math.max(0, (m.totalCandidat || 1) - 1),
                    candidats: (m.candidats || [])
                };
            }
            return m;
        }));
    };

    /**
     * Permet de s'inscrire sur un service et de l'afficher instantanément sur la carte dès que l'utilisateur clique sur "Je le fais!"(demande),
     * sans attendre que la base de données réponde
     * @param serviceId le service auquelle on vient de s'inscrire
     */
    const addLocalDemande = (serviceId) => {
        // on récupère l'ancienne liste des services pour pouvoir la modifier
        setAllMarkers(prev => prev.map(m => {
            if (m.id === serviceId) {
                return {
                    ...m,
                    pouce: true,
                    totalCandidat: (m.totalCandidat || 0) + 1,
                    // Crucial : on ajoute l'ID pour que getPoint puisse envoyer candidat_id
                    candidats: [...(m.candidats || [])]
                };
            }
            return m;
        }));
    };

    /**
     * Permet de se désinscrire sur un service et de l'afficher instantanément sur la carte dès que l'utilisateur clique sur "Je le fais plus!"(demande),
     * sans attendre que la base de données réponde
     * @param serviceId le service auquelle on vient de s'inscrire
     */
    const removeLocalDemande = (serviceId) => {
        // on récupère l'ancienne liste des services pour pouvoir la modifier
        setAllMarkers(prev => prev.map(m => {
            if (m.id === serviceId) {
                return {
                    ...m,
                    pouce: false,
                    totalCandidat: Math.max(0, (m.totalCandidat || 1) - 1),
                    candidats: (m.candidats || [])
                };
            }
            return m;
        }));
    };

    /**
     * Fait l'appel d'API qui permet de s'inscrire à un service qui est une proposition
     * @param serviceId le service auquelle on s'inscrit
     */
    const registerToProposition = (serviceId) => {
        Post(`services/inscription/${serviceId}`, token, {}, () => addLocalProposition(serviceId));
    };

    /**
     * Fait l'appel d'API pour se désinscrire d'un service qui est une proposition
     * @param serviceId le service duquel on se désinscrit
     */
    const unregisterFromProposition = (serviceId) => {
        Delete(`services/desinscription/${serviceId}`, token, () => removeLocalProposition(serviceId));
    };

    /**
     * Fait l'appel d'API pour s'inscrire à un service qui est une demande
     * @param serviceId le service auquel on s'inscrit
     */
    const registerToDemande = (serviceId) => {
        Post(`services/inscription/${serviceId}`, token, {}, () => addLocalDemande(serviceId));
    };

    /**
     * Fait l'appel d'API pour se désinscrire d'un service qui est une demande
     * @param serviceId le service duquel on se désinscrit
     */
    const unregisterFromDemande = (serviceId) => {
        Delete(`services/desinscription/${serviceId}`, token, () => removeLocalDemande(serviceId));
    };

    /**
     * Permet d'envoyer un message à un autre utilisateur via l'API
     * @param destinataireId l'identifiant de la personne qui doit recevoir le message
     * @param text le contenu du message à envoyer
     */
    const handleSendMessage = (destinataireId, text) => {
        // On vérifie que le texte n'est pas vide avant d'envoyer
        if (!text.trim()) return;

        Post(
            "messages",
            token,
            {
                destinataireId: destinataireId,
                texte: text,
            },
            () => {
                alert("Message envoyé avec succès !");
            },
            (err) => {
                console.error("Erreur lors de l'envoi du message", err);
                const errorMsg = err?.response?.data?.error || "Impossible d'envoyer le message.";
                alert(errorMsg);
            }
        );
    };

    /**
     * Utilise l'API Nominatim pour transformer une adresse en coordonnées GPS
     * @param e l'événement du clavier (on cherche la touche Entrée)
     */
    const handleAddressSearch = async (e) => {
        // Si on appuye sur entrée et que l'addresse n'est pas vide
        if (e.key === 'Enter' && isAddingService && searchTerm.trim() !== "") {
            try {
                // ON appelle l'API qui transforme les adresses en coordonnées GPS
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    const {lat, lon} = data[0];
                    const coords = {lat: parseFloat(lat), lng: parseFloat(lon)};

                    setTempCoords(coords);
                    map.flyTo([coords.lat, coords.lng], 16); // Centre la map sur l'adresse trouvée
                } else {
                    alert("Adresse non trouvée");
                }
            } catch (error) {
                console.error("Erreur de géocodage:", error);
            }
        }
    };

    /**
     * Composant utilitaire pour détecter les clics de l'utilisateur sur la carte
     * @param onMapClick fonction appelée avec les coordonnées du clic
     */
    function MapClickHandler({onMapClick}) {
        useMapEvents({
            click(e) {
                onMapClick(e.latlng);
            },
        });
        return null;
    }

    /**
     * Gère l'ouverture d'une popup de service avec un effet de centrage décalé pour ne pas cacher le marqueur
     * @param index l'index du marqueur dans la liste des refs
     */
    const openServicePopup = (index) => {
        const marker = markerRefs.current[index];
        const cluster = clusterRef.current;
        const offsetX = 250;

        if (marker && cluster && map) {
            // 1. Zoomer pour "éclater" le cluster si besoin
            cluster.zoomToShowLayer(marker, () => {
                const latLng = marker.getLatLng();

                // 2. Calculer le point cible en pixels, appliquer le décalage, puis convertir en coordonnées
                const targetPoint = map.project(latLng, map.getZoom()).add([offsetX, 0]);
                const targetLatLng = map.unproject(targetPoint, map.getZoom());

                // 3. Déplacement fluide vers la position décalée
                map.flyTo(targetLatLng, map.getZoom(), {
                    animate: true,
                    duration: 0.8,
                });

                // 4. Ouvrir la popup après une courte pause pour laisser le mouvement se stabiliser
                setTimeout(() => {
                    marker.openPopup();
                }, 600);
            });
        }
    };

    /**
     * Crée l'icône personnalisée pour les regroupements de marqueurs (clusters)
     * @param cluster l'objet cluster contenant les marqueurs regroupés
     * @returns {divIcon} l'icône configurée avec le nombre de services
     */
    const createCustomClusterIcon = function (cluster) {
        return new divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
            className: "custom-marker-cluster section rounded-full flex items-center justify-center bg-white font-bold",
            iconSize: point(40, 40, true)
        });
    };

    /**
     * Gère le clic sur la carte pour placer un nouveau service
     * @param latlng les coordonnées géographiques du clic
     */
    const handleMapClick = (latlng) => {
        if (isAddingService) {
            setTempCoords(latlng);
            setShowForm(true);      // Ouvre la modale de saisie
            setIsAddingService(false); // Sort du mode "attente de clic"
            setSearchTerm("");
        }
    };

    /**
     * Fait l'appel d'API pour valider qu'un service a bien été rendu et attribuer les points
     * @param service le service concerné par la validation
     */
    const getPoint = (service) => {
        if (service.type === 'proposition') {
            console.log(service.candidats);
            Post(`services/validation/${service.id}`, token)

            setAllMarkers(prevMarkers =>
                prevMarkers.filter(m => m.id !== service.id)
            );

        } else {
            console.log(service.candidats);
            Post(`services/validation/${service.id}`, token, {candidat_id: service.candidats[0].id}, () => {

            })

            setAllMarkers(prevMarkers =>
                prevMarkers.filter(m => m.id !== service.id)
            );
        }

    }

    /**
     * Détermine dynamiquement quel bouton d'action afficher selon l'état du service (passé/futur) et le rôle de l'utilisateur
     * @param service le service à analyser
     * @returns {React.JSX.Element|null} le bouton correspondant ou rien si aucune action n'est possible
     */
    const renderActionButton = (service) => {

        const startTime = new Date(service.date.replace(" ", "T"));
        const endTime = new Date(startTime.getTime() + (service.duree || 0) * 60000);
        const now = new Date();
        const isPast = now > endTime;

        // Normalisation des rôles
        const isOwner = !!service.isUserService;
        const isTypeDemande = service.type?.toLowerCase() === "demande";
        const isTypeProposition = service.type?.toLowerCase() === "proposition";

        const typeKey = isTypeProposition ? 'proposition' : 'demande';

        // "pouce" signifie que j'ai accepté d'aider sur une DEMANDE
        const iAmHelperOnDemande = !!service.pouce;
        // "estInscrit" signifie que je reçois l'aide sur une PROPOSITION
        const iAmRecipientOfProposition = !!service.estInscrit;

        // RÔLE : LE BÉNÉFICIAIRE (Celui qui confirme avoir reçu l'aide)
        // - Soit c'est MA demande
        // - Soit je me suis inscrit à LA proposition de quelqu'un d'autre
        const isRecipient = (isOwner && isTypeDemande) || (service.estInscrit && isTypeProposition);

        // --- CAS A : LE SERVICE EST PASSÉ (LOGIQUE DE VALIDATION) ---
        if (isPast) {
            // RÔLE : L'AIDANT (Celui qui doit gagner des points)
            // - Soit c'est MA proposition
            // - Soit j'ai accepté d'aider sur LA demande de quelqu'un d'autre
            const isHelper = (isOwner && isTypeProposition) || (service.pouce && isTypeDemande);
            if (isHelper) {

                if (service.totalCandidat > 1) {
                    return (
                        <button
                            onClick={(e) => {e.stopPropagation(); console.log("Claim points", service.id); }}
                            className="flex-1 py-2 px-4 bg-[#DAA520] text-white rounded-lg font-semibold shadow-lg animate-gold-dense flex items-center justify-center gap-2">
                            Vos points arrive !
                        </button>
                    );
                }
            }

            if (isRecipient) {
                return (
                    <button
                        onClick={(e) => { e.stopPropagation(); getPoint(service); }}
                        className="flex-1 py-2 px-4 bg-on-surface-variant text-white rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 transform hover:scale-105 hover:cursor-pointer transition-all">
                        Service rendu !
                    </button>
                );
            }

            return null;
        }

        // Le propriétaire ne peut JAMAIS interagir avec ses propres boutons futurs
        if (isOwner) {
            return null;
        }

        // --- CAS B : LE SERVICE EST FUTUR (LOGIQUE D'INSCRIPTION) ---
        // Logique pour les autres utilisateurs
        const isAlreadyRegistered = iAmHelperOnDemande || iAmRecipientOfProposition;
        const config = {
            proposition: {
                active: { text: "Se désinscrire", action: () => unregisterFromProposition(service.id), color: "bg-error", textColor: "text-on-error" },
                inactive: { text: "S'inscrire", action: () => registerToProposition(service.id), color: "bg-primary-fixed-dim", textColor: "text-on-primary" }
            },
            demande: {
                active: { text: "Je le fais plus", action: () => unregisterFromDemande(service.id, service.type), color: "bg-error", textColor: "text-on-error" },
                inactive: { text: "Je le fais !", action: () => registerToDemande(service.id, service.type), color: "bg-primary-fixed-dim", textColor: "text-on-primary" }
            }
        };

        // Permet de savoir si une personne est inscris ou non à un service
        const stateKey = isAlreadyRegistered ? 'active' : 'inactive';
        const btn = config[typeKey][stateKey];

        return (
            <button
                onClick={(e) => { e.stopPropagation(); btn.action(); }}
                className={`flex-1 py-2 px-4 ${btn.color} text-white rounded-lg font-semibold shadow-md transform hover:scale-105 hover:cursor:pointer transition-all`}
            >
                <p className={btn.textColor}>{btn.text}</p>
            </button>
        );
    };

    /**
     * Vérifie si la date et l'heure de fin du service sont déjà passées par rapport à maintenant
     * @param service le service à vérifier
     * @returns {boolean} vrai si le service est terminé
     */
    const shouldBeDone = (service) => {

        // Permet de calculer si la date du service est rendu
        const startTime = new Date(service.date.replace(" ", "T"));
        const endTime = new Date(startTime.getTime() + (service.duree || 0) * 60000);

        return new Date() > endTime;
    }

    /**
     * Détermine si le service est en mode "réclamation de points" (terminé et utilisateur impliqué comme aidant)
     * @param service le service à analyser
     * @returns {boolean} vrai si l'utilisateur peut prétendre à des points
     */
    const checkClaimMode = (service) => {

        // Va permettre de calculer si la date du service est rendu
        const startTime = new Date(service.date.replace(" ", "T"));
        const endTime = new Date(startTime.getTime() + (service.duree || 0) * 60000);
        const isPast = new Date() > endTime;

        const isClaimMode = isPast && (service.pouce || (service.isUserService && service.type.toLowerCase() === "proposition"));

        return isClaimMode;
    }

    // 1. Logique commune : Date, Recherche, Droits
    const filteredByLogic = allMarkers.filter((marker) => {
        const startTime = new Date(marker.date.replace(" ", "T"));
        const endTime = new Date(startTime.getTime() + (marker.duree || 0) * 60000);
        const isPast = new Date() > endTime;

        // Garder si futur, ou si utilisateur est impliqué (Propriétaire/Inscrit)
        const isRelevant = !isPast || marker.isUserService || marker.estInscrit || marker.pouce;
        if (!isRelevant) return false;

        // Masquer si passé, mien, et personne n'est venu aider
        const isMineNone = isPast && marker.isUserService && marker.totalCandidat < 1;
        if (isMineNone) return false;

        // Filtre de recherche textuelle
        const title = marker.nom || "";
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // 2. Pour la CARTE : On garde tout ce qui est logique (indépendamment de la vue)
    const markersToRender = filteredByLogic;

    /**
     * Permet de gérer les services que l'on va afficher à l'utilisateur
     * @type {(*&{originalIndex: *})[]}
     */
    const visibleServices = filteredByLogic
        .map((marker, index) => ({ ...marker, originalIndex: index })) // On garde l'index pour la popup
        .filter((marker) => {
            return mapBounds ? mapBounds.contains(marker.geocode) : true;
        });

    return (
        <div className="relative flex flex-col h-full w-full overflow-hidden">

            {/* --- Formulaire d'erreur sur l'appel API de la carte --- */}
            {showErrorForm && (
                <div className="absolute inset-0 z-3000 flex items-center justify-center bg-scrim/60 backdrop-blur-sm">
                    <div className="bg-surface-container p-8 rounded-2xl shadow-2xl w-96 text-center flex flex-col gap-4 border-t-4 border-error">
                        <div className="flex justify-center text-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-on-surface">Erreur de chargement</h3>
                        <p className="text-on-surface italic">
                            Impossible de communiquer avec le serveur merci de réessayer plus tard.
                        </p>
                        <button
                            onClick={() => setShowErrorForm(false)}
                            className="mt-2 py-3 bg-error text-on-error rounded-xl font-bold shadow-lg hover:bg-error-container hover:text-on-error-container transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* --- Formulaire de création de service --- */}
            {showForm && (
                <div className="absolute inset-0 z-2000 flex items-center justify-center bg-scrim/50 backdrop-blur-sm pointer-events-none">
                    <div className="bg-surface-container p-6 rounded-2xl shadow-2xl w-96 flex flex-col gap-4 pointer-events-auto">
                        <h3 className="text-xl font-bold border-b border-outline-variant pb-2 text-on-surface">Nouveau Service</h3>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-on-surface">Type de service</label>
                            <select
                                className="w-full border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-on-surface outline-none focus:border-primary"
                                value={newService.type}
                                onChange={(e) => setNewService({...newService, type: e.target.value})}
                            >
                                <option value="proposition">Offrir un service</option>
                                <option value="demande">Demander un service</option>
                            </select>
                        </div>

                        <TextField
                            placeholder="Titre (ex: Covoiturage)"
                            inputStyle={"bg-surface-container-lowest"}
                            currentValue={newService.title}
                            onChange={(e) => setNewService({...newService, title: e.target.value})}
                        />

                        <textarea
                            placeholder="Description..."
                            className="w-full border border-outline-variant rounded-lg p-3 h-28 bg-surface-container-lowest text-on-surface outline-none focus:border-primary placeholder:text-on-surface/60"
                            value={newService.description}
                            onChange={(e) => setNewService({...newService, description: e.target.value})}
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface uppercase">Date et Heure</label>
                            <input
                                type="datetime-local"
                                className="border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none dark-mode-datetime"
                                value={newService.date}
                                onChange={(e) => setNewService({...newService, date: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Durée </label>
                            {getDurationLimitLabel()}
                            <div className="flex items-center gap-1">
                                {/* Input pour les heures*/}
                                <input
                                    className="w-full border rounded-lg p-2 bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="number"
                                    placeholder="HH"
                                    min="0"
                                    value={Math.floor(newService.duree / 60) || ""}
                                    onChange={(e) => convertMinute(e.target.value, 'h')}
                                />

                                <span className="font-bold text-on-surface">h</span>

                                {/* Input pour les minutes */}
                                <input
                                    className="w-full border rounded-lg p-2 bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="number"
                                    placeholder="MM"
                                    min="0"
                                    max="59"
                                    value={(newService.duree % 60) || ""}
                                    onChange={(e) => convertMinute(e.target.value, 'm')}
                                />

                                <span className="font-bold text-gray-600">m</span>
                            </div>
                        </div>

                        {newService.type.toLowerCase() === "proposition" && ( <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface uppercase">Participants Max</label>
                            <input
                                type="number"
                                min="1"
                                className="border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                                value={newService.maxDemandeurs}
                                onChange={(e) => setNewService({...newService, maxDemandeurs: parseInt(e.target.value)})}
                            />
                        </div>)}


                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 bg-surface-container-high text-on-surface rounded-lg font-semibold hover:bg-surface-container-highest transition-colors cursor-pointer">Annuler
                            </button>
                            <button onClick={saveService}
                                    className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-md hover:bg-primary/90 transition-colors cursor-pointer">Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INTERFACE "Service disponible" */}
            <div className="absolute top-4 right-8 bottom-4 z-1000 w-1/3 pointer-events-none pt-4 pb-4">
                <div
                    className='section flex flex-col w-full h-full p-4 pointer-events-auto bg-surface/90 backdrop-blur-sm shadow-2xl rounded-xl border border-outline-variant text-on-surface'>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className='text-xl font-bold text-on-surface'>Services disponibles</h2>
                        <button
                            onClick={() => { setIsAddingService(!isAddingService);
                                setIsEditing(false); // <--- TRÈS IMPORTANT : On force le mode création
                                setCurrentServiceId(null);
                                setSearchTerm("");
                                setNewService({ // On vide le formulaire au cas où
                                    type: "proposition",
                                    title: "",
                                    description: "",
                                    maxDemandeurs: 1,
                                    date: "",
                                    duree: 60
                                });}}
                            className={`w-15 h-15 flex items-center justify-center rounded-xl transition-all shadow-md leading-none ${
                                isAddingService
                                    ? "bg-error text-on-error rotate-45"
                                    : "bg-primary text-on-primary hover:bg-primary/90"
                            } cursor-pointer`}
                            title="Ajouter un service"
                        >
                            <span className="text-5xl font-light leading-none select-none mb-2">+</span>
                        </button>
                    </div>

                    {/* --- Barre de recherche double usage --- */}
                    <div className="pr-2 mb-4">
                        <TextField
                            className="w-full"
                            placeholder={isAddingService ? "Tapez une adresse + Entrée..." : "Rechercher un service..."}
                            currentValue={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleAddressSearch} // Déclenche la recherche d'adresse sur Entrée
                            section={true}
                        />
                    </div>

                    {isAddingService && (
                        <div className="mb-2 text-center animate-pulse">
                            <span
                                className="text-[10px] font-bold bg-on-tertiary-fixed-variant text-white px-3 py-1 rounded-full uppercase">
                                Cliquez sur un lieu sur la carte
                            </span>
                        </div>
                    )}

                    {/* --- Affichage des services disponible et/ou trier*/}
                    <div className="flex-1 overflow-y-auto pr-2">
                        {!isAddingService ? (
                            // MODE NORMAL : Liste des services
                            visibleServices.length > 0 ? (
                                visibleServices.map((service, index) => {

                                    // 1. Calcul de la date (identique à renderActionButton pour être raccord)
                                    const startTime = new Date(service.date.replace(" ", "T"));
                                    const endTime = new Date(startTime.getTime() + (service.duree || 0) * 60000);
                                    const isPastService = shouldBeDone(service);

                                    const isOwner = service.isUserService === true;

                                    return (
                                        <div key={index}
                                             className='section flex flex-row items-center w-full p-2 mt-3 bg-surface-container'>
                                            <CardMap
                                                className={'flex-1 h-full hover:cursor-pointer w-full flex flex-row'}
                                                textTopIcon={service.type === "proposition" ? "Proposition" : "Demande"}
                                                leftIcon={service.type.toLowerCase() === "proposition"
                                                    ? "/icons/volunteer_activism.svg"
                                                    : "/icons/question_mark.svg"}
                                                leftSpacing={'ml-2'}
                                                contentAlign={'flex flex-col justify-center'}
                                                contentSpacing={'h-2'}
                                                title={service.nom}
                                                description={service.description}
                                                section={false}
                                                type={checkClaimMode(service) ? null : service.type}
                                                pouce={service.pouce}
                                                dateAffichee={checkClaimMode(service) ? null : formatServiceDate(service.date)}
                                                rightIcon={(isOwner && !isPastService) ? '/icons/edit.svg' : null}
                                                secondRightIcon={(isOwner && !isPastService) ? '/icons/trash.svg' : null}
                                                iconStyle={'w-12 h-12'}
                                                iconClassName={'service-card-icon'}
                                                demandeur={service.totalCandidat}
                                                maxDemandeur={service.maxDemandeurs}
                                                onClickRightEdit={(isOwner && !isPastService) ? () => editService(service) : null}
                                                onClickRightTrash={(isOwner && !isPastService)  ? () => setServiceToDelete(service.id) : null}
                                                onClickLeft={() => openServicePopup(service.originalIndex)}
                                                onClickContent={() => openServicePopup(service.originalIndex)}
                                                textRight={renderActionButton(service)}
                                            />
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-center text-on-surface mt-10">Aucun service trouvé.</p>
                            )
                        ) : (
                            // Instructions au lieu de la liste
                            <div
                                className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                                <div className="bg-tertiary-container p-4 rounded-xl">
                                    <img src="/icons/location_on.svg" className="w-8 h-8 service-icon" alt="loc"/>
                                </div>
                                <p className="text-on-surface font-medium">
                                    Saisissez une adresse ci-dessus et appuyez sur <b className="text-on-surface">Entrée</b>, ou cliquez
                                    directement sur un point de la carte.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/*Interface de confirmation de supression d'un service*/}
            {serviceToDelete && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-surface-container rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scaleIn">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
                                <img src="/icons/trash.svg" className="w-8 h-8 service-icon" alt="Poubelle" />
                            </div>

                            <h3 className="text-xl font-bold text-on-surface mb-2">Supprimer le service ?</h3>
                            <p className="text-on-surface/70 mb-6">
                                Cette action est irréversible. Toutes les données liées à ce service seront perdues.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setServiceToDelete(null)}
                                    className="flex-1 py-3 px-4 bg-surface-container-high text-on-surface rounded-xl font-semibold hover:bg-surface-container-highest transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        deleteService(serviceToDelete);
                                        setServiceToDelete(null);
                                    }}
                                    className="flex-1 py-3 px-4 bg-error text-on-error rounded-xl font-semibold hover:bg-error/90 shadow-lg shadow-error/30 transition-all cursor-pointer"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LA CARTE (DERRIÈRE) */}
            <MapContainer
                className="grow w-full h-full rounded-4xl overflow-hidden"
                center={mapCenter}
                zoom={13}
                minZoom={3}
                maxZoom={19}
                worldCopyJump={true} //  empêche de monter/descendre dans le gris infini
                maxBounds={[
                    [-85, -Infinity], // limite sud (évite l'Antarctique extrême)
                    [85,  Infinity],  // limite nord (évite le pôle)
                ]}
                maxBoundsViscosity={1.0} // 1 = mur, 0 = pas d'effet
                ref={setMap}
                whenReady={(e) => {
                    const mapInstance = e.target;
                    const center = mapInstance.getCenter();
                    const bounds = mapInstance.getBounds();
                    const distance = center.distanceTo(bounds.getNorthWest());

                    // On initialise tout d'un coup
                    setCurrentCenter({ lat: center.lat, lng: center.lng });
                    setMapBounds(bounds);
                    setViewRadius(distance);
                }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <MapInfoHandler
                    onUpdate={(dist) => setViewRadius(dist)}
                    onBoundsChange={(bounds) => setMapBounds(bounds)}
                />
                <MapClickHandler onMapClick={handleMapClick} />

                    <MarkerClusterGroup chunkedLoading iconCreateFunction={createCustomClusterIcon} ref={clusterRef}>
                        {markersToRender.map((service, index) => (

                        <Marker key={service.id}
                                position={service.geocode}
                                icon={customIcon}
                                ref={(el) => (markerRefs.current[index] = el)}>
                            <Popup maxWidth={500} minWidth={350}>
                                <CardMap
                                    className="p-2 w-full min-w-[350px] flex flex-row items-center"
                                    textTopIcon={service.type === "proposition" ? "Proposition" : "Demande"}
                                    leftIcon={
                                        service.type.toLowerCase() === "proposition"
                                            ? "/icons/volunteer_activism.svg"
                                            : "/icons/question_mark.svg"
                                    }
                                    leftSpacing="pr-2"
                                    title={service.nom}
                                    description={service.description}
                                    type={service.type}
                                    demandeur={service.totalCandidat || 0}
                                    maxDemandeur={service.maxDemandeurs}
                                    dateAffichee={formatServiceDate(service.date)}
                                    showMessageField={!service.isUserService}
                                    messagePlaceholder="Envoyer un message au propriétaire..."
                                    onSendMessage={(text) => handleSendMessage(service.idCreateur, text)}
                                />
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

        </div>
    );
}

export default Map;

