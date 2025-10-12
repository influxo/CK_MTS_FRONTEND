import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import sqTranslations from '../locales/sq.json';

type Language = 'en' | 'sq';

type Translations = typeof enTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en: enTranslations,
  sq: sqTranslations,
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get saved language from localStorage or default to Albanian
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'sq') ? saved : 'sq';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function with nested key support (e.g., "common.loading")
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
