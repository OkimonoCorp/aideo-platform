import React, {useState} from "react";

/**
 * FormField - Composant pour les champs de formulaire avec icônes optionnelles
 * Utilisé pour Login, Signin et autres formulaires
 *
 * @param {string} icon - Chemin vers l'icône (optionnel)
 * @param {string} iconAlt - Texte alternatif de l'icône
 * @param {string} placeholder - Texte du placeholder
 * @param {string} type - Type d'input (text, password, email, etc.)
 * @param {string} currentValue - Valeur initiale
 * @param {function} onChange - Callback lors du changement de valeur
 * @param {boolean} withIcon - Afficher l'icône (défaut: true si icon est fourni)
 *
 * @param {string} iconExtra - Chemin vers l'icône (optionnel)
 * @param {string} iconExtraAlt - Texte alternatif de l'icône
 */
function FormField({
                       icon,
                       iconAlt = "icon",
                       placeholder = "",
                       type = "text",

                       currentValue = "",
                       onChange = () => {},
                       disabled = false,
                       className = "",

                       iconExtra,
                       iconExtraAlt = "extra icon",
                       onExtraIconClick,
                       extraIconButtonLabel = "action",

                       required = false
                   }) {
    const [value, setValue] = useState(currentValue);

    React.useEffect(() => {
        setValue(currentValue || '');
    }, [currentValue]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange?.(newValue);
    };

    return (
        <label
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-container-lowest border-outline-variant/40 shadow-inner border transition-colors duration-200 ${className}`}
        >
            {icon && (
                <img
                    src={icon}
                    alt={iconAlt}
                    className="w-5 h-5 opacity-80 shrink-0"
                />
            )}

            <input
                //data-testid={dataTestId}
                className={`flex-1 min-w-0 outline-none bg-transparent text-sm placeholder-on-surface-variant ${
                    value ? "text-on-surface" : "text-on-surface-variant"
                }`}
                placeholder={placeholder}
                type={type}
                value={value}
                onChange={handleChange}
                required={required}
                disabled={disabled}
            />

            {iconExtra && (

                <button
                    type="button"
                    onClick={onExtraIconClick}
                    aria-label={extraIconButtonLabel}
                    className="shrink-0 cursor-pointer">

                    <img
                        src={iconExtra}
                        alt={iconExtraAlt}
                        className="w-5 h-5 opacity-80"/>

                </button>

            )}
        </label>
    );
}

export default FormField;
