import React, {useState, useEffect} from 'react';


/**
 * TextField est un composant qui est une zone de texte personnalisable
 * @param name est le nom qui permet au conteneur parent de différencier ce TextField d'un autre
 * @param className permet de modifier le style CSS du TextField
 * @param label est le nom qui apparait en haut du TextField ("Nom" quand on veut que l'utilisateur remplisse son nom)
 * @param placeholder est le texte qui s'afficher quand le TextField est vide
 * @param currentValue permet de préremplire le TextField avec les infos personnel par exemple
 * @param type permet de définir le type de la donnée qui sera contenu dans le TextField
 * @param inputStyle contient le style CSS de la donnée qui est rentré
 * @param onChange permet d'appeler des fonctions quand l'intérieur de la zone de texte est modifée
 * @param readOnly permet de faire en sorte que le TextField soit modifiable ou non
 * @param section permet de mettre ou non l'attribut CSS section qui met une bordure autour de l'élément
 */
function TextField({
                       name,
                       className,
                       label,
                       placeholder,
                       currentValue,
                       type = 'text',
                       inputStyle,
                       onChange = () => {},
                       onKeyDown = () => {},
                       readOnly = false,
                       section = true,
                       // optional filter: 'digits' -> only 0-9, 'alpha' -> letters, spaces, hyphen, apostrophe
                       filter
                   }) {
    const [value, setValue] = useState(currentValue || '');
    const [isComposing, setIsComposing] = useState(false);

    // Permet de modifier la valeur du TextField quand currentValue change
    useEffect(() => {
        setValue(currentValue || '');
    }, [currentValue]);

    // Permet de gérer les changements quand on modifie le TextField
    const handleChange = (e) => {
        let raw = e.target.value || '';

        // si la composition est en cours (IME), mettre à jour uniquement la valeur locale affichée
        if (isComposing) {
            setValue(raw);
            return;
        }

        // Appliquer un filtre optionnel fourni via la prop `filter`.
        // - 'digits' : ne garder que les chiffres
        // - 'alpha'  : ne garder que les lettres (avec accents), espaces, '-' et '\''
        // - 'phone'  : formatage lisible pour numéros de téléphone (FR et international basique)
        let filtered = raw;
        if (filter === 'digits') {
            // supprimer tout caractère non numérique
            filtered = raw.replace(/\D+/g, '');
        } else if (filter === 'alpha') {
            // autoriser lettres accentuées, espaces, apostrophes et tirets
            filtered = raw.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]+/g, '');
        } else if (filter === 'phone') {
            // Gestion spécifique pour les téléphones : on prépare une version 'display' lisible
            // et une version 'normalized' envoyée au parent (sans espaces, avec + si présent).
            const hasPlus = raw.trim().startsWith('+');
            let digits = raw.replace(/[^\d]/g, '');
            if (digits.length > 11) digits = digits.slice(0, 10);

            // fonction utilitaire : groupe les chiffres par paire pour l'affichage
            const pair = (s) => s.match(/.{1,2}/g)?.join(' ') || s;

            let display = digits;
            if (hasPlus) {
                // gestion spéciale pour +33 (France) : afficher +33 puis le reste groupé
                if (digits.startsWith('33')) {
                    const rest = digits.slice(2);
                    if (rest.length === 0) display = `+33`;
                    else {
                        const first = rest.charAt(0);
                        const others = rest.slice(1);
                        display = `+33 ${first}${others ? ' ' + pair(others) : ''}`.trim();
                    }
                } else {
                    // format international générique : +XX XX XX ...
                    display = `+${pair(digits)}`;
                }
            } else if (digits.startsWith('0')) {
                // format national (ex: 01 23 45 67 89)
                const firstTwo = digits.slice(0, 2);
                const rest = digits.slice(2);
                display = `${firstTwo}${rest ? ' ' + pair(rest) : ''}`.trim();
            } else {
                // sans préfixe : grouper par paire
                display = pair(digits);
            }

            filtered = display;

            // normalized = valeur envoyée au parent (sans espaces, conserve + si présent)
            const normalized = hasPlus ? `+${digits}` : digits;
            setValue(filtered);
            try {
                onChange({ target: { value: normalized } });
            } catch (err) {
                // ignore si onChange personnalisé lève une erreur
            }
            return;
        }

        // Valeur filtrée par défaut (digits/alpha ou non filtrée)
        setValue(filtered);

        try {
            // Notifier le parent avec la valeur filtrée
            onChange({ target: { value: filtered } });
        } catch (err) {
            // Si le parent attend l'événement original, fallback
            onChange(e);
        }
    };

    let sectionStyle = section ? 'section' : ''; // Cypress pour savoir s'il faut mettre ou pas une bordure

    return (
        <div className={`${className || ''} textField`}>
            {label ? <label className={'textFieldLabel'}>{label}</label> : null}
            <input
                className={`${inputStyle || ''} textFieldInput ${sectionStyle}`}
                placeholder={placeholder}
                type={type}
                value={value}
                name={name || ''} // fais en sorte que le parent peut l'identifier
                onChange={handleChange}
                onKeyDown={onKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e) => {
                    setIsComposing(false);
                    // apply filters once composition ends
                    handleChange(e);
                }}
                readOnly={readOnly}
            />
        </div>
    );
}

export default TextField;
