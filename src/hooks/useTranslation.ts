import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook to access translation function and language state
 * 
 * @example
 * const { t, language, setLanguage } = useTranslation();
 * 
 * // Use translation
 * <h1>{t('common.loading')}</h1>
 * 
 * // Switch language
 * setLanguage('en'); // or 'sq'
 */
export const useTranslation = () => {
  const { t, language, setLanguage, translations } = useLanguage();
  
  return {
    t,
    language,
    setLanguage,
    translations,
  };
};
