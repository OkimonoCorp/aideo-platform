import React from "react";

/**
 * On voit le composant Card comme une carte avec
 — à gauche une icône potentielle qui peut être cliquable
 — au milieu du texte avec un titre et une description, les deux peuvent être cliquable
 — à droite une autre icône potentielle qui peut être cliquable

 Entre chacun de ces éléments (ainsi qu'entre le titre et la description), il peut y avoir des espaces personnalisables
 via les classes CSS de leftSpacing et rightSpacing.

 Le texte au centre peut être aligné de différentes manières grâce à la propriété contentAlign.
 Par défaut, le texte est aligné en colonne (titre au-dessus de la description).
 *
 */
function Card({
                  className = "w-full flex flex-row",
                  leftIcon,
                  leftSpacing,
                  iconStyle = "w-12 h-12",
                  contentAlign = 'flex flex-col',
                  title,
                  contentSpacing,
                  description,
                  rightSpacing,
                  rightIcon,
                  textRight,
                  secondRightIcon,
                  iconClassName = '',
                  section = true,
                  onClickSecondRight = () => {},
                  onClickRight = () => {},
                  onClickLeft = () => {},
                  onClickContent = () => {}
              }) {

    let sectionStyle = section ? 'section' : '';

    return (
        <div className={`${className} ${sectionStyle}`}>
            {leftIcon && (
                <div onClick={() => onClickLeft()} className={`shrink-0 flex items-center justify-center ${contentAlign}`}>
                    {typeof leftIcon === 'string' ? (
                        <img className={`${iconStyle} ${iconClassName} object-contain `} src={leftIcon} alt=''/>
                    ) : (
                        leftIcon
                    )}
                </div>
            )}

            {leftSpacing && (
                <div onClick={() => onClickContent()} className={`${leftSpacing}`}></div>
            )}

            <div onClick={() => onClickContent()} className={`${contentAlign} flex-1 min-w-0`}>
                <h2 className='break-words whitespace-normal font-bold text-on-surface'> {title} </h2>
                {contentSpacing && (
                    <div className={`${contentSpacing}`}></div>
                )}
                <p className='break-words whitespace-normal text-sm text-on-surface-variant'> {description}  </p>
            </div>

            {rightSpacing && (
                <div onClick={() => onClickContent()} className={`${rightSpacing}`}></div>
            )}

            {rightIcon && (
                <div className={`${contentAlign} `}>
                    {typeof rightIcon === 'string' ? (
                        <img
                            onClick={() => onClickRight()}
                            className={`${iconStyle} ${iconClassName} `}
                            src={rightIcon}
                            alt=''
                        />
                    ) : (
                        /* On affiche le bouton JSX directement */
                        <div onClick={(e) => {
                            e.stopPropagation();
                            onClickRightEdit();
                        }}>
                            {textRight}
                        </div>
                    )}

                    {secondRightIcon &&
                        <img onClick={() => onClickSecondRight()} className={`${iconStyle} ${iconClassName}`}
                             src={secondRightIcon} alt=''/>}
                </div>
            )}
        </div>
    );
}

export default Card;
