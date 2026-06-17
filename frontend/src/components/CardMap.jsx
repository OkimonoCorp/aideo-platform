import React, {useState} from "react";
import TextField from "./TextField.jsx";
import Thumb from "/icons/thumb.svg?react"

/**
 * Composant dédié à l'affichage des détails d'un service (titre, description, boutons) dans la liste ou les popups de la carte
 * @param className style CSS du conteneur principal
 * @param leftIcon icône ou image affichée à gauche
 * @param leftSpacing espace cliquable entre l'icône gauche et le texte
 * @param iconStyle style CSS appliqué aux icônes
 * @param contentAlign alignement du bloc de texte central
 * @param title titre du service
 * @param contentSpacing espace entre le titre et la description
 * @param description texte descriptif du service
 * @param demandeur nombre actuel de personnes inscrites
 * @param maxDemandeur nombre maximum de personnes autorisées
 * @param rightSpacing espace cliquable entre le texte et la partie droite
 * @param textTopIcon petit texte affiché au-dessus de l'icône gauche
 * @param rightIcon icône d'édition (généralement un crayon)
 * @param textRight bouton d'action principal (S'inscrire, Valider, etc.)
 * @param dateAffichee date du service formatée pour l'affichage
 * @param pouce indicateur visuel pour savoir si l'utilisateur aide sur une demande
 * @param secondRightIcon icône de suppression (généralement une poubelle)
 * @param iconClassName classe CSS supplémentaire pour les icônes
 * @param type type de service (proposition ou demande)
 * @param section si vrai, applique un style de bordure/ombre de section
 * @param onClickRightEdit fonction appelée au clic sur l'icône d'édition
 * @param onClickRightTrash fonction appelée au clic sur l'icône de suppression
 * @param onClickLeft fonction appelée au clic sur l'icône de gauche
 * @param onClickContent fonction appelée au clic sur le corps de la carte
 * @param showMessageField si vrai, affiche la zone de saisie de message
 * @param messagePlaceholder texte d'aide dans le champ message
 * @param onSendMessage fonction appelée lors de l'envoi du message
 * @returns {React.JSX.Element}
 * @constructor
 */
function CardMap({
                  className = "w-full flex flex-row",
                  leftIcon,
                  leftSpacing,
                  iconStyle = "w-12 h-12",
                  contentAlign = 'flex flex-col',
                  title,
                  contentSpacing,
                  description,
                  demandeur,
                  maxDemandeur,
                  rightSpacing,
                  textTopIcon,
                  rightIcon,
                  textRight,
                  dateAffichee,
                  pouce,
                  secondRightIcon,
                  iconClassName = '',
                  type,
                  section = true,
                  onClickRightEdit = () => {},
                  onClickRightTrash = () => {},
                  onClickLeft = () => {},
                  onClickContent = () => {},
                  showMessageField = false,
                  messagePlaceholder = "Message...",
                  onSendMessage = () => {}
              }) {

    // Style conditionnel pour l'encadré
    let sectionStyle = section ? 'section' : '';
    // État local pour le texte du message privé
    const [messageText, setMessageText] = useState('')

    /**
     * Gère l'envoi du message en vérifiant qu'il n'est pas vide
     */
    const handleSend = () => {
        const txt = messageText.trim()
        if (!txt) return
        onSendMessage(txt) // On déclenche la fonction passée en paramètre
        setMessageText('') // On vide le champ après l'envoi
    }

    return (
        <div className={`${className} ${sectionStyle} text-on-surface/80`}>

            {/* Partie Gauche : Icône de catégorie */}
            {leftIcon && (
                <div onClick={() => onClickLeft()} className={`flex-shrink-0 flex items-center justify-center ${contentAlign}`}>
                    <p className={"text-2xs"}>{textTopIcon}</p>
                    <img className={`${iconStyle} ${iconClassName} object-contain service-icon`} src={leftIcon} alt=''/>
                </div>
            )}

            {/* Espacement interactif à gauche */}
            {leftSpacing && (
                <div onClick={() => onClickContent()} className={`${leftSpacing}`}></div>
            )}

            {/* Partie Centrale : Informations textuelles du service */}
            <div onClick={() => onClickContent()} className={`${contentAlign} flex-1 min-w-0`}>
                <h2 className='break-words whitespace-normal font-bold text-on-surface/80 block min-h-[1.2em]'> {title} </h2>

                {/* Affichage spécifique pour les PROPOSITIONS (compteur d'inscrits) */}
                {type?.toLowerCase() === "proposition" && maxDemandeur > 0 && (
                    <div>
                        <p className="text-xs font-medium text-on-surface/80  mt-1">
                            Inscrits : <span className="text-primary-fixed-dim">{demandeur || 0}</span> / {maxDemandeur}
                        </p>
                        <p className="text-xs text-on-surface/80 font-bold">
                            Début le {dateAffichee}
                        </p>
                    </div>
                )}

                {/* Affichage spécifique pour les DEMANDES (icône pouce ou texte d'incitation) */}
                {type?.toLowerCase() === "demande" && (
                    <div className="mt-1">
                        {pouce ? (
                                <div>
                                    <div className="flex items-center gap-2 ">
                                        <Thumb className="w-5 h-5 fill-current text-primary-fixed-dim"/>
                                        <span className="text-xs font-bold text-primary-fixed-dim">C'est noté !</span>
                                    </div>
                                    <p className="text-xs font-bold text-on-surface/80">
                                        Début le {dateAffichee}
                                    </p>
                                </div>
                        ) : (
                            <div>
                                <p className="text-xs font-medium text-on-surface/80">
                                    Un petit coup de pouce ?
                                </p>
                                <p className="text-xs font-bold text-on-surface/80">
                                    Début le {dateAffichee}
                                </p>
                            </div>

                        )}
                    </div>
                )}

                {contentSpacing && (
                    <div className={`${contentSpacing}`}></div>
                )}
                <p className='break-words whitespace-normal text-sm text-on-surface/80'> {description}  </p>

                {/* Zone de chat rapide : affichée seulement si activée (ex: dans une popup) */}
                {showMessageField && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                            <TextField
                                className="flex-1"
                                inputStyle="h-8"
                                placeholder={messagePlaceholder}
                                currentValue={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSend())}
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSend(); }}
                                className="py-2 px-3 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Envoyer
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Espacement interactif à droite */}
            {rightSpacing && (
                <div onClick={() => onClickContent()} className={`${rightSpacing}`}></div>
            )}

            {/* Partie Droite : Bouton d'inscription et actions d'édition/suppression */}
            <div className={`${contentAlign} flex flex-col items-center justify-center min-w-[120px] gap-2`}>

                {/* Bouton d'action principal (S'inscrire / Désinscrire / Valider) */}
                {textRight && (
                    <div className="w-full flex justify-center">
                        {textRight}
                    </div>
                )}

                {/* Zone des icônes de gestion (uniquement pour le propriétaire du service) */}
                <div className="flex flex-row items-center gap-3">
                    {/* Icône de modification */}
                    {rightIcon && typeof rightIcon === 'string' && (
                        <img
                            onClick={(e) => { e.stopPropagation(); onClickRightEdit(); }}
                            className={`${iconStyle} ${iconClassName} cursor-pointer hover:scale-110 transition-transform service-icon`}
                            src={rightIcon}
                            alt='Edit'
                        />
                    )}

                    {/* Icône de suppression */}
                    {secondRightIcon && (
                        <img
                            onClick={(e) => { e.stopPropagation(); onClickRightTrash(); }}
                            className={`${iconStyle} ${iconClassName} cursor-pointer hover:scale-110 transition-transform service-icon`}
                            src={secondRightIcon}
                            alt='Delete'
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
export default CardMap;
