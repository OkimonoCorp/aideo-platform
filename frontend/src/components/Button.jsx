import React from 'react';
import {Link} from "react-router-dom";

/**
 * Le composant Button est un bouton qui prend différent paramètre permettant de personnaliser le bouton
 * @param className permet de mettre différent style CSS
 * @param text est le texte que contient le bouton
 * @param route est le chemin vers où amène le bouton (si le bouton n'amène vers aucun chemin, il suffit de pas mettre le paramètre)
 * @param active permet d'activer ou non le bouton
 * @param activeStyle contient les styles CSS des boutons quand ils sont actifs
 * @param inactiveStyle contient les styles CSS des boutons quand ils sont inactifs
 * @param onClick contient l'action que va déclencher le bouton
 */
function Button({ className = '', text, route, active = true, activeStyle = '', inactiveStyle = '', onClick }) {
    const style = active ? activeStyle : inactiveStyle;

    const baseClasses = `inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold transition-transform duration-150 ease-in-out shadow-sm ${style} ${className}`.trim();

    const interactiveClasses = `${baseClasses} hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed`;

    if (route) {
        return (
            <Link to={route} onClick={onClick} className={interactiveClasses} role="button" aria-disabled={!active}>
                {text}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} disabled={!active} className={interactiveClasses}>
            {text}
        </button>
    );
}

export default Button;