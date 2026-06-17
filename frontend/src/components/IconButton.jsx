import React from 'react'
import {Link} from "react-router-dom";

/**
 * Permet d'afficher une icône cliquable
 * @param className est la classe CSS que l'on veut appliquer au bouton
 * @param icon est l'URL de l'icon que l'on veut afficher
 * @param route est là où on veut aller quand on clique sur l'icon
 * @param onClick est la fonction à appeler quand on clique sur l'icon
 * @param title est le texte qui s'affiche au survol de l'icon
 */
function IconButton({className, icon, route, onClick, title, label}) {
    // fixed height to avoid layout shift when label wraps to 2 lines
    const base = `${className ?? ''} flex flex-col items-center justify-center rounded-4xl p-2 cursor-pointer text-gray-700 dark:text-white overflow-hidden`;
    const content = (
        <>
            <div className="flex-1 flex items-center justify-center opacity-80 dark:opacity-100">
                {icon}
            </div>
            {label && (
                <span className="text-xs mt-1 h-8 leading-tight text-center break-words overflow-hidden w-full">
                    {label}
                </span>
            )}
        </>
    );

    return (
        <>
            {route ? (
                <Link className={base} to={route} onClick={onClick} title={title} aria-label={title}>
                    {content}
                </Link>
            ) : (
                <button className={base} onClick={onClick} title={title} aria-label={title}>
                    {content}
                </button>
            )}
        </>
    )
}

export default IconButton


{    /* Usage Example:
    function IconButton({className = 'w-20 h-20', icon, route, onClick, title}) {
    const base = `${className} p-2 cursor-pointer flex flex-col items-center justify-center`;
    return (
        <>
            {route ? (
                <Link className={base} to={route} onClick={onClick} title={title}>
                    {icon}
                    {// On n'affiche que dans le cas d'un bouton de redirection (route définie).
                        title && <span className="text-xs mt-1 text-center text-inherit">{title}</span>}
                </Link>
            ) : (
                <button className={base} onClick={onClick} title={title}>
                    {icon}
                </button>
            )}
        </>
    )
}

export default IconButton */    }