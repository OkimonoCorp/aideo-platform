import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';

const NotFound = () => {
  const nav = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-variant relative">
      <img 
        src={'/logo/logo_submark_secondaire.svg'}
        alt="submark"
        className="absolute top-center left-1/2 -translate-x-1/2 w-250 opacity-90" 
      />

      <div className="w-[420px] p-6 pb-1 rounded-[50px] bg-surface-container/90 backdrop-blur-xl shadow-lg flex flex-col items-center">
        <div className="-mt-12">
          <div className="w-22 h-12 rounded-xl flex items-center justify-center bg-primary border-2 border-surface-container shadow-md">
            <img src={'/logo/logo_primaire_blanc.svg'} alt="logo" className="w-16 h-16" />
          </div>
        </div>

        <div className="w-full mt-3 p-6 rounded-3xl bg-surface-container-high/90 shadow-lg flex flex-col gap-4 items-center text-center">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          
          <h2 className="text-2xl font-semibold text-on-surface">Page non trouvée</h2>
          
          <p className="text-sm text-on-surface-variant">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <button
              data-testid="btn-home-error"
            onClick={() => nav('/')} 
            className="mt-4 w-full py-2 rounded-full bg-primary text-on-primary font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 cursor-pointer"
          > 
            Retourner à l'accueil 
           
          </button>

    
        </div>

        <img 
          src={isDarkMode ? '/logo/logo_primaire_blanc.svg' : '/logo/logo_primaire_noire.svg'} 
          alt="logo" 
          className="w-16 mt-6" 
        />
      </div>
    </div>
  );
};

export default NotFound;
