import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from './BackButton';
import { useTheme } from '../contexts/ThemeContext.jsx';

const AuthLayout = ({ title, children, bottomLinkText, bottomLinkHref }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-surface-variant relative overflow-hidden">

      {/* Back button */}
      <BackButton />

      {/* Fond d'écran */}
      <img
        src={"/logo/logo_submark_secondaire.svg"}
        alt="submark"
        className="absolute top-center left-1/2 -translate-x-1/2 w-250 opacity-90"
      />

      {/* Carte principale - surface-container-lowest avec transparence */}
      <div className="w-105 p-6 pb-1 rounded-[50px] bg-surface-container-lowest/60 backdrop-blur-xl shadow-lg flex flex-col items-center">

          {/* Logo en haut - inverse-primary pour contraste */}
          <div className="-mt-12 w-22 h-12 rounded-xl flex items-center justify-center bg-inverse-primary border border-outline-variant/60">
            <img
              src={"/logo/logo_primaire_blanc.svg"}
              alt="logo"
              className="w-16 h-16"
            />
          </div>

       {/* Conteneur du formulaire */}
        <div className="w-full mt-3 p-4 rounded-3xl bg-surface-container-lowest/30 shadow-lg flex flex-col gap-3 max-h-[70vh] overflow-y-auto overflow-x-hidden">

          {title && (
            <h2 className="text-center text-lg text-on-surface-variant font-semibold">{title}</h2>
          )}

          {children}
        </div>

        {/* Lien vers inscription - on-surface-variant */}
        {bottomLinkHref ? (
          <Link to={bottomLinkHref} className="mt-3 mb-2 text-sm text-on-surface-variant hover:text-primary hover:underline">
            {bottomLinkText}
          </Link>
        ) : bottomLinkText ? (
          <div className="mt-3 mb-2 text-sm text-on-surface-variant">{bottomLinkText}</div>
        ) : null}

        {/* bottom logo - dynamique selon le thème */}
        <img
          src={isDarkMode ? "/logo/logo_primaire_blanc.svg" : "/logo/logo_primaire_noire.svg"}
          alt="logo"
          className="w-16"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
