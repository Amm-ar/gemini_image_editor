import { useState, useEffect, useCallback } from 'react';
import ar from '../locales/ar.json' with { type: 'json' };
import en from '../locales/en.json' with { type: 'json' };
import es from '../locales/es.json' with { type: 'json' };
import fr from '../locales/fr.json' with { type: 'json' };
import hi from '../locales/hi.json' with { type: 'json' };

type Translations = { [key: string]: any };

const translations: { [key: string]: Translations } = { ar, en, es, fr, hi };

export const availableLanguages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'hi', name: 'हिन्दी' },
];

export const useLocalization = () => {
    // Default to Arabic
    const [language, setLanguage] = useState('ar');

    useEffect(() => {
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
    }, [language]);

    const t = useCallback((key: string, replacements: { [key: string]: string | number } = {}): string => {
        let translation = translations[language]?.[key] || translations['en']?.[key] || key;
        
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            translation = translation.replace(regex, String(replacements[placeholder]));
        });
        
        return translation;
    }, [language]);

    const ta = useCallback((key: string): string[] => {
         return translations[language]?.[key] || translations['en']?.[key] || [];
    }, [language]);


    return { language, setLanguage, t, ta };
};