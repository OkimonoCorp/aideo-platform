import React, {useState, useEffect, useRef} from 'react';
import IconButton from "./IconButton.jsx";
import AccountCircle from '/icons/account_circle.svg?react';
import Checklist from '/icons/checklist.svg?react';
import MapIcon from '/icons/map.svg?react';
import MessageIcon from '/icons/chat_bubble.svg?react';
import MarketplaceIcon from '/icons/storefront.svg?react';
import CalendarIcon from '/icons/calendar_month.svg?react';
import LightModeIcon from '/icons/light_mode.svg?react';
import DarkModeIcon from '/icons/dark_mode.svg?react';
import { useLocation } from 'react-router-dom';
import { GetBinary } from "../util/APIUtils.js";
import { TOKEN_STORAGE_KEY } from "../App.jsx";
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * SideBar est le composant qui permet de naviguer entre les différentes pages du site
 */
function SideBar({className, pages, pathInfo}) {
    // Utiliser le contexte pour le thème
    const { theme, toggleTheme } = useTheme();

    // État pour stocker l'URL de la photo de profil
    const [profileLogoUrl, setProfileLogoUrl] = useState(null);
    // Reference pour stocker l'URL de l'objet
    const profileObjectUrlRef = useRef(null);

    const location = useLocation();

    // Recuperation de la photo de profil au montage
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) return;

        // Ajouter un timestamp pour éviter le cache
        GetBinary(`profile/photo_profil?t=${Date.now()}`, token,
            (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                profileObjectUrlRef.current = objectUrl;
                setProfileLogoUrl(objectUrl);
            },
            () => {
                setProfileLogoUrl(null); // Gérer l'absence de photo
            }
        );

        return () => {
            if (profileObjectUrlRef.current) {
                URL.revokeObjectURL(profileObjectUrlRef.current);
                profileObjectUrlRef.current = null;
            }
        };
    }, []);


    // On garde en mémoire l'indice de l'icône sélectionnée
    const [selectedIndex, setSelectedIndex] = useState(0)

    // Met à jour l'icône sélectionnée en fonction du path courant
    useEffect(() => {
        const target = pathInfo[location.pathname];
        if (target !== undefined) {
            setTimeout(() => {
                setSelectedIndex(target);
            }, 0);
        }
    }, [location]);

        return (
            <>
                <div
                    className={`hidden md:flex app-sidebar ${className ?? ''} p-4 items-center gap-3 rounded-4xl flex-col justify-between overflow-hidden`}
                >
                    <div className={'h-fit flex flex-col'}>
                        {pages && pages.map((page, index) => (
                        <IconButton
                            key={index}
                            title={page.title}
                            className={`mb-4 ${selectedIndex === index ? 'icon-selected' : 'icon'}`}
                            icon={index === 0 && profileLogoUrl
                                ? <img src={profileLogoUrl} alt="Profil" className="w-8 h-8 rounded-lg object-cover"/>
                                : page.icon
                            }
                            route={page.route}
                            onClick={() => setSelectedIndex(index)}
                        />
                        ))}
                    </div>

                    {/* Theme toggle (desktop only) */}
                    <div>
                        <IconButton
                            className="theme-toggle"
                            icon={theme === 'dark' ? <DarkModeIcon className="w-14 h-14" /> : <LightModeIcon className="w-14 h-14" />}
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                        />
                    </div>
                </div>

                {/* MOBILE BOTTOM BAR (< md) */}
                <nav
                    className="md:hidden fixed bottom-0 left-0 right-0 z-1000 bg-surface/90 backdrop-blur-md border-t border-outline px-3 py-2"
                    aria-label="Navigation"
                >
                    <div className="mx-auto max-w-md flex items-center justify-between gap-2">
                        <IconButton
                            className={`${selectedIndex === 0 ? 'icon-selected' : 'icon'} !w-12 !h-12 !rounded-full !bg-surface/80 !text-primary`}
                            icon={profileLogoUrl
                                ? <img src={profileLogoUrl} alt="Profil" className="w-7 h-7 rounded-full object-cover"/>
                                : <AccountCircle className="w-7 h-7 fill-current text-inherit" />
                            }
                            route={'/info'}
                            onClick={() => setSelectedIndex(0)}
                            title="Profil"
                        />

                        <IconButton
                            className={`${selectedIndex === 1 ? 'icon-selected' : 'icon'} !w-12 !h-12 !rounded-full !bg-surface/80 !text-primary`}
                            icon={<Checklist className="w-7 h-7 fill-current text-inherit" />}
                            route={'/notes'}
                            onClick={() => setSelectedIndex(1)}
                            title="Notes"
                        />

                        <IconButton
                            className={`${selectedIndex === 2 ? 'icon-selected' : 'icon'} !w-12 !h-12 !rounded-full !bg-surface/80 !text-primary`}
                            icon={<MapIcon className="w-7 h-7 fill-current text-inherit" />}
                            route={'/map'}
                            onClick={() => setSelectedIndex(2)}
                            title="Carte"
                        />

                        <IconButton
                            className={`${selectedIndex === 3 ? 'icon-selected' : 'icon'} !w-12 !h-12 !rounded-full !bg-surface/80 !text-primary`}
                            icon={<MessageIcon className="w-7 h-7 fill-current text-inherit" />}
                            route={'/messages'}
                            onClick={() => setSelectedIndex(3)}
                            title="Messages"
                        />

                        <IconButton
                            className={`${selectedIndex === 4 ? 'icon-selected' : 'icon'} !w-12 !h-12 !rounded-full !bg-surface/80 !text-primary`}
                            icon={<MarketplaceIcon className="w-7 h-7 fill-current text-inherit" />}
                            route={'/marketplace'}
                            onClick={() => setSelectedIndex(4)}
                            title="Avantages"
                        />

                        <IconButton
                            className={`${selectedIndex === 5 ? 'icon-selected' : 'icon'} !w-12 !h-12 !rounded-full !bg-surface/80 !text-primary`}
                            icon={<CalendarIcon className="w-7 h-7 fill-current text-inherit" />}
                            route={'/calendar'}
                            onClick={() => setSelectedIndex(5)}
                            title="Calendrier"
                        />
                    </div>
                </nav>
            </>
        );
}

export default SideBar;

        