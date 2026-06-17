import React from 'react';
import SideBar from "./SideBar.jsx";
import {Outlet} from "react-router-dom";
import AccountCircle from '/icons/account_circle.svg?react';
import MapIcon from '/icons/map.svg?react';
import MessageIcon from '/icons/chat_bubble.svg?react';
import MarketplaceIcon from '/icons/storefront.svg?react';
import CalendarIcon from '/icons/calendar_month.svg?react';
import Checklist from '/icons/checklist.svg?react';

import StoreIcon from "/icons/store.svg?react";
import LoyaltyIcon from "/icons/loyalty.svg?react";


// Style commun à toutes les icônes
const iconStyle = "w-20 h-20"

const userPages = [
    {
        title: "Profil",
        route: "/info",
        icon: <AccountCircle className={iconStyle}/>,
    },
    {
        title: "Carte",
        route: '/map',
        icon: <MapIcon className={iconStyle}/>,
    },
    {
        title: "Messages",
        route: '/messages',
        icon: <MessageIcon className={iconStyle}/>,
    },
    {
        title: "Avantages",
        route: '/marketplace',
        icon: <MarketplaceIcon className={iconStyle}/>,
    },
    {
        title: "Calendrier",
        route: '/calendar',
        icon: <CalendarIcon className={iconStyle}/>,
    },
    {
        title: "Notes",
        route: '/notes',
        icon: <Checklist className={iconStyle}/>,
    },
]

const partnerPages = [
    {
        title: "Informations",
        route: "/company",
        icon: <AccountCircle className={iconStyle}/>,
    },
    {
        title: "Adresses",
        route: '/addresses',
        icon: <StoreIcon className={iconStyle}/>,
    },
    {
        title: "Avantages",
        route: '/advantages',
        icon: <LoyaltyIcon className={iconStyle}/>,
    }
]

const userPathInfo = {
    '/info': 0,
    '/map': 1,
    '/messages': 2,
    '/marketplace': 3,
    '/calendar': 4,
    '/notes': 5,
}

const partnerPathInfo = {
    '/company': 0,
    '/addresses': 1,
    '/advantages': 2,
}

const adminPages = []

/**
 * Le composant Layout est un conteneur principal qui organise la disposition de la page
 en incluant une barre latérale (SideBar) et une section de contenu principale.
 * @param role définit le rôle de l'utilisateur pour afficher les pages appropriées dans la SideBar
 * @param bgStyle permet de définir le style de fond du conteneur principal
 */
function Layout({role, bgStyle}) {
    return (
        <div className={`${bgStyle} w-full h-full flex flex-row px-lg md:p-4`}>
            <SideBar pages={role === 'aidant' ? userPages : (role === 'partenaire' ? partnerPages : adminPages)}
                pathInfo={role === 'aidant' ? userPathInfo : (role === 'partenaire' ? partnerPathInfo : adminPages)}/>
            <div className="section w-full h-full md:ml-4 pb-15 bg-surface-variant overflow-y-scroll md:pb-0 rounded-none md:rounded-4xl">
                <Outlet /> {/* Les enfants passés au Layout */}
            </div>
            
        </div>
    );
}

export default Layout;