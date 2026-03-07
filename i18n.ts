import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationPA from './locales/pa/translation.json';

// Get the initial language from local storage, fallback to English
const savedLanguage = localStorage.getItem('app_lang') || 'English';

// Map our application language names to i18next language codes
const getLanguageCode = (langName: string) => {
    if (langName === 'Hindi') return 'hi';
    if (langName === 'Punjabi') return 'pa';
    return 'en'; // English and others default to 'en' for fixed UI if we don't have json files yet
};

const resources = {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    pa: { translation: translationPA },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getLanguageCode(savedLanguage),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
