import React, {useState} from 'react';


/**
 * TextArea est un composant qui est une grande zone de texte personnalisable
 * @param className contient les styles CSS de la zone de texte
 * @param currentValue est le texte que contient la zone de texte
 * @param onChange permet d'appeler des fonctions quand l'intérieur de la zone de texte est modifer
 * @param placeholder affiche un texte indicatif quand la zone est vide
 */
function TextArea({className, currentValue = '', onChange, placeholder = ''}) {
    const [value, setValue] = useState(currentValue || '');

    return (
        <textarea
            className={`${className} resize-none overflow-y-scroll whitespace-pre-wrap break-words`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
                setValue(e.target.value);
                onChange(e);
            }}
        />
    );
}

export default TextArea;