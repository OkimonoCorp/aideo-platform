import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    // Fonction pour appliquer le thème au DOM
    const applyTheme = (newTheme) => {
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        try {
            localStorage.setItem('theme', newTheme);
        } catch (e) {
            console.log(e);
        }
    };

    // Toggle entre les thèmes
    const toggleTheme = () => {
        applyTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Au montage, initialiser le thème depuis localStorage ou préférence OS
    useEffect(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') {
                applyTheme(saved);
                return;
            }
        } catch (e) {
            console.log(e);
        }

        // Sinon, utiliser la préférence du système
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

