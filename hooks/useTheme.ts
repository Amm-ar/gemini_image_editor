import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
    const getInitialTheme = (): Theme => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                return storedTheme;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    };
    
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);

        localStorage.setItem('theme', theme);
    }, [theme]);

    return { theme, toggleTheme };
};
